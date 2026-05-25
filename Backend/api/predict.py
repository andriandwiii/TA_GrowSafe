# ===================================================================
# File: predict.py
# Lokasi: GrowSafe/Backend/api/predict.py
# ===================================================================

import io
import os
import sys
import uuid

# Fix path agar import dari root Backend selalu bisa ditemukan
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi                          import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm                   import Session
from PIL                              import Image
from database                         import SessionLocal
from models.deteksi_yolo              import DeteksiYolo
from models.prediksi                  import Prediksi
from models.kumbung                   import Kumbung
from models.notifikasi                import Notifikasi
from schemas.prediksi_schema          import PrediksiResponse
from schemas.deteksi_schema           import DeteksiResponse
from services.prediction_service      import run_yolo_detection, predict_risk, predict_panen
from services.id_generator            import generate_id_yolo, generate_id_prediksi, generate_id_notifikasi
from services.recommendation_service  import tentukan_kategori, get_rekomendasi
from services.fcm_service             import buat_konten_notifikasi
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

    # ── MENGHITUNG AVERAGE INFECTED AREA (Lebih Efektif) ──
    infected_area = 0.0
    
    # Ambil 5 riwayat deteksi terakhir dari kumbung ini (sampling populasi)
    recent_detections = db.query(DeteksiYolo).filter(
        DeteksiYolo.id_kumbung == id_kumbung
    ).order_by(DeteksiYolo.created_at.desc()).limit(5).all()

    if recent_detections:
        total_infected = sum((d.infected_area_percent or 0.0) for d in recent_detections) # type: ignore
        infected_area = float(total_infected / len(recent_detections)) # type: ignore
    
    # (Opsional) Jika user mengirim id_yolo spesifik, kita bisa memberikan bobot lebih 
    # atau cukup gunakan nilai average dari populasi di atas. Kita gunakan average agar lebih robust.

    hasil = predict_risk(
        suhu                  = suhu,
        kelembaban            = kelembaban,
        total_led_menyala     = total_led_menyala,
        infected_area_percent = infected_area
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
        rekomendasi_risiko = hasil["rekomendasi_risiko"]
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

    return prediksi