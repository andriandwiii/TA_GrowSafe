# ===================================================================
# File: predict.py
# Lokasi: GrowSafe/Backend/api/predict.py
# ===================================================================

import io
import os
import sys
import uuid
from datetime import datetime, timedelta

# Fix path agar import dari root Backend selalu bisa ditemukan
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi                          import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm                   import Session
from sqlalchemy                       import func as sql_func
from PIL                              import Image
from database                         import SessionLocal
from models.deteksi_yolo              import DeteksiYolo
from models.prediksi                  import Prediksi
from models.kumbung                   import Kumbung
from models.sensor_data               import SensorData
from models.notifikasi                import Notifikasi
from schemas.prediksi_schema          import PrediksiResponse
from schemas.deteksi_schema           import DeteksiResponse
from services.prediction_service      import run_yolo_detection, predict_risk, predict_panen
from services.id_generator            import generate_id_yolo, generate_id_prediksi, generate_id_notifikasi
from services.recommendation_service  import tentukan_kategori, get_rekomendasi
from services.fcm_service             import buat_konten_notifikasi, send_notification
from api.auth                         import get_current_user, get_db
from models.user                      import Pengguna

router     = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── POST /predict/image ────────────────────────────────────────────
@router.post("/image", response_model=DeteksiResponse)
async def deteksi_gambar(
    file: UploadFile        = File(...),
    id_kumbung: str         = Form(...),
    db: Session             = Depends(get_db),
    current_user: Pengguna  = Depends(get_current_user)
):
    """Upload foto baglog → Deteksi black mold dengan YOLO."""

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar")

    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    contents   = await file.read()
    image      = Image.open(io.BytesIO(contents))
    hasil_yolo = run_yolo_detection(image)

    file_name = f"{uuid.uuid4()}.jpg"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    # Jika YOLO menemukan penyakit, simpan gambar yang sudah ada kotak (bounding box)-nya
    if hasil_yolo.get("plotted_image"):
        hasil_yolo["plotted_image"].save(file_path, format="JPEG")
    else:
        # Jika tidak, simpan foto asli
        with open(file_path, "wb") as f:
            f.write(contents)

    deteksi = DeteksiYolo(
        id_yolo               = generate_id_yolo(db),
        id_kumbung            = id_kumbung,
        image_path            = file_path,
        confidence_score      = hasil_yolo["confidence_score"],
        infected_area_percent = hasil_yolo["infected_area_percent"]
    )
    db.add(deteksi)
    db.commit()
    db.refresh(deteksi)
    return deteksi


# ── HELPER: Hitung Weighted Infected Area ─────────────────────────
def _hitung_weighted_infected_area(db: Session, id_kumbung: str) -> tuple[float, int]:
    """
    Menghitung rata-rata tertimbang (weighted average) dari infected_area_percent
    berdasarkan deteksi dalam 7 hari terakhir.
    
    Data terbaru mendapat bobot lebih tinggi (recency weighting).
    
    Returns:
        tuple: (weighted_infected_area, jumlah_deteksi)
    """
    cutoff = datetime.now() - timedelta(days=7)
    recent_detections = db.query(DeteksiYolo).filter(
        DeteksiYolo.id_kumbung  == id_kumbung,
        DeteksiYolo.created_at  >= cutoff
    ).order_by(DeteksiYolo.created_at.desc()).all()

    if not recent_detections:
        return 0.0, 0

    # Weighted average: deteksi terbaru mendapat bobot lebih besar
    # Terbaru (i=0) → bobot 1.0, kedua (i=1) → 0.5, ketiga (i=2) → 0.33, dst.
    total_weight = 0.0
    weighted_sum = 0.0
    for i, d in enumerate(recent_detections):
        weight = 1.0 / (i + 1)
        area_val: float = float(d.infected_area_percent or 0.0)  # type: ignore[arg-type]
        weighted_sum += area_val * weight
        total_weight += weight

    infected_area = round(weighted_sum / total_weight, 2) if total_weight > 0 else 0.0
    return infected_area, len(recent_detections)


# ── HELPER: Hitung Confidence Level Prediksi ──────────────────────
def _hitung_confidence_level(db: Session, id_kumbung: str, jumlah_deteksi: int) -> str:
    """
    Menentukan tingkat kepercayaan prediksi berdasarkan ketersediaan data.
    
    Semakin banyak data sensor dan deteksi visual yang tersedia,
    semakin tinggi tingkat kepercayaan prediksi.
    
    Kriteria:
    - Tinggi  : ≥ 50 data sensor DAN ≥ 10 deteksi visual dalam 7 hari
    - Sedang  : ≥ 20 data sensor DAN ≥ 3 deteksi visual dalam 7 hari
    - Rendah  : di bawah kriteria Sedang
    """
    cutoff = datetime.now() - timedelta(days=7)

    jumlah_sensor = db.query(sql_func.count(SensorData.id)).filter(
        SensorData.id_kumbung  == id_kumbung,
        SensorData.created_at  >= cutoff
    ).scalar() or 0

    if jumlah_sensor >= 50 and jumlah_deteksi >= 10:
        return "Tinggi"
    elif jumlah_sensor >= 20 and jumlah_deteksi >= 3:
        return "Sedang"
    else:
        return "Rendah"


# ── HELPER: Tentukan Fase Pertumbuhan Otomatis ────────────────────
def _tentukan_fase(kumbung) -> str:
    """
    Tentukan fase pertumbuhan jamur berdasarkan waktu mulai budidaya.

    Fase pertumbuhan jamur tiram:
      - Inkubasi  :  0 - 14 hari  (miselium menyebar di baglog)
      - Primordia : 15 - 21 hari  (bakal jamur mulai tumbuh)
      - Produksi  : 22+ hari      (jamur tumbuh dan siap panen)

    Jika waktu_mulai_budidaya tidak diset, default ke "Produksi".
    """
    if not kumbung.waktu_mulai_budidaya:
        return "Produksi"

    from datetime import date
    hari_budidaya = (date.today() - kumbung.waktu_mulai_budidaya).days

    if hari_budidaya < 0:
        return "Inkubasi"  # Belum mulai
    elif hari_budidaya <= 14:
        return "Inkubasi"
    elif hari_budidaya <= 21:
        return "Primordia"
    else:
        return "Produksi"


# ── POST /predict/risk ─────────────────────────────────────────────
@router.post("/risk", response_model=PrediksiResponse)
def prediksi_risiko(
    id_kumbung: str         = Form(...),
    suhu: float             = Form(...),
    kelembaban: float       = Form(...),
    total_led_menyala: int  = Form(...),
    id_yolo: str            = Form(None),
    db: Session             = Depends(get_db),
    current_user: Pengguna  = Depends(get_current_user)
):
    """Jalankan prediksi risiko black mold + potensi panen."""

    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    # ── TENTUKAN FASE PERTUMBUHAN ─────────────────────────────────
    # Dihitung otomatis berdasarkan waktu_mulai_budidaya di data kumbung.
    fase = _tentukan_fase(kumbung)

    # ── WEIGHTED AVERAGE INFECTED AREA (7 hari terakhir) ──────────
    # Menggunakan recency weighting: deteksi terbaru berbobot lebih tinggi.
    # Ini lebih representatif dibandingkan simple average dari 5 deteksi terakhir.
    infected_area, jumlah_deteksi = _hitung_weighted_infected_area(db, id_kumbung)

    # ── HITUNG CONFIDENCE LEVEL ───────────────────────────────────
    # Mengukur seberapa percaya diri prediksi berdasarkan ketersediaan data
    # sensor IoT (holistic monitoring) dan deteksi visual (spot-check).
    confidence_level = _hitung_confidence_level(db, id_kumbung, jumlah_deteksi)

    hasil = predict_risk(
        suhu                  = suhu,
        kelembaban            = kelembaban,
        total_led_menyala     = total_led_menyala,
        infected_area_percent = infected_area,
        fase                  = fase
    )

    panen_kg = predict_panen(
        kapasitas_baglog = kumbung.kapasitas_baglog or 0, # type: ignore
        risk_persen      = hasil["risk_persen"]
    )

    prediksi = Prediksi(
        id_prediksi        = generate_id_prediksi(db),
        id_kumbung         = id_kumbung,
        risk_persen        = hasil["risk_persen"],
        predicted_panen_kg = panen_kg,
        kategori_risiko    = hasil["kategori_risiko"],
        rekomendasi_risiko = hasil["rekomendasi_risiko"],
        confidence_level   = confidence_level
    )
    db.add(prediksi)
    db.commit()
    db.refresh(prediksi)

    if hasil["kategori_risiko"] in ["Sedang", "Tinggi"]:
        konten = buat_konten_notifikasi(
            kategori     = hasil["kategori_risiko"],
            risk_persen  = hasil["risk_persen"],
            nama_kumbung = str(kumbung.nama_kumbung) if kumbung.nama_kumbung else "Kumbung"
        )
        notif = Notifikasi(
            id_notifikasi = generate_id_notifikasi(db),
            id_pengguna   = current_user.id_pengguna,
            id_prediksi   = prediksi.id_prediksi,
            judul         = konten["judul"],
            isi           = konten["isi"],
            status_baca   = "Belum"
        )
        db.add(notif)
        db.commit()

        # Kirim push notification ke perangkat mobile
        if current_user.fcm_token:
            send_notification(
                fcm_token=str(current_user.fcm_token),
                judul=konten["judul"],
                isi=konten["isi"],
                data={"id_prediksi": prediksi.id_prediksi, "kategori": hasil["kategori_risiko"]}
            )

    return prediksi