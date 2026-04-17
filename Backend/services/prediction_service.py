# ===================================================================
# File: prediction_service.py
# Lokasi: GrowSafe/Backend/services/prediction_service.py
# Deskripsi: Layanan prediksi risiko black mold dan potensi panen
#            menggunakan Model Regresi Linear.
#
# CATATAN: Model akan di-train menggunakan data CSV dari jurnal
#          yang akan diberikan. Sementara ini menggunakan formula
#          sementara yang akan diganti setelah model tersedia.
# ===================================================================

import os
import pickle
import numpy as np
from PIL import Image
from services.recommendation_service import tentukan_kategori, get_rekomendasi

# ── Load Model YOLO ────────────────────────────────────────────────
try:
    from ultralytics import YOLO
    yolo_model = YOLO("best.pt")
    print("✅ Model YOLO 'best.pt' berhasil dimuat.")
except Exception as e:
    yolo_model = None
    print(f"⚠️  Model YOLO tidak ditemukan: {e}")

# ── Load Model Regresi Linear ──────────────────────────────────────
# Model akan disimpan sebagai file .pkl setelah training dengan CSV
REGRESSION_MODEL_PATH = "models_ml/regression_model.pkl"

try:
    with open(REGRESSION_MODEL_PATH, "rb") as f:
        regression_model = pickle.load(f)
    print("✅ Model Regresi Linear berhasil dimuat.")
except Exception as e:
    regression_model = None
    print(f"⚠️  Model Regresi Linear belum tersedia: {e}")


# ── Deteksi YOLO ───────────────────────────────────────────────────
def run_yolo_detection(image: Image.Image) -> dict:
    """
    Jalankan deteksi YOLO pada gambar baglog.
    Return: confidence_score dan infected_area_percent
    """
    if yolo_model is None:
        return {"confidence_score": 0.0, "infected_area_percent": 0.0}

    results = yolo_model(image)
    
    if not results or len(results[0].boxes) == 0:
        return {"confidence_score": 0.0, "infected_area_percent": 0.0}

    # Ambil deteksi dengan confidence tertinggi
    boxes      = results[0].boxes
    best_box   = max(boxes, key=lambda b: float(b.conf))
    confidence = float(best_box.conf)

    # Hitung persentase area terinfeksi dari bounding box
    img_w, img_h = image.size
    x1, y1, x2, y2 = best_box.xyxy[0].tolist()
    box_area       = (x2 - x1) * (y2 - y1)
    total_area     = img_w * img_h
    infected_pct   = round((box_area / total_area) * 100, 2) if total_area > 0 else 0.0

    return {
        "confidence_score":      round(confidence, 4),
        "infected_area_percent": infected_pct
    }


# ── Prediksi Risiko Black Mold ─────────────────────────────────────
def predict_risk(
    suhu: float,
    kelembaban: float,
    total_led_menyala: int,
    infected_area_percent: float = 0.0
) -> dict:
    """
    Prediksi persentase risiko black mold menggunakan Regresi Linear.
    
    Input:
    - suhu                 : rata-rata suhu (°C)
    - kelembaban           : rata-rata kelembaban (%)
    - total_led_menyala    : total durasi aktor menyala (menit)
    - infected_area_percent: persentase area terinfeksi dari YOLO (0-100)

    Return: dict berisi risk_persen, kategori_risiko, rekomendasi
    """

    if regression_model is not None:
        # ── Gunakan model yang sudah di-train ──
        features    = np.array([[suhu, kelembaban, total_led_menyala, infected_area_percent]])
        risk_persen = float(regression_model.predict(features)[0])
        risk_persen = max(0.0, min(100.0, risk_persen))  # clamp 0-100
    else:
        # ── Formula sementara sebelum CSV tersedia ──
        # Faktor suhu: makin tinggi dari 28°C, makin berisiko
        faktor_suhu        = max(0, (suhu - 28) * 5)
        # Faktor kelembaban: makin tinggi dari 90%, makin berisiko
        faktor_kelembaban  = max(0, (kelembaban - 90) * 2)
        # Faktor waktu operasi: makin lama aktor menyala, makin berisiko
        faktor_led         = min(20, total_led_menyala * 0.1)
        # Faktor visual YOLO
        faktor_yolo        = infected_area_percent * 0.5

        risk_persen = min(100.0, faktor_suhu + faktor_kelembaban + faktor_led + faktor_yolo)

    kategori    = tentukan_kategori(risk_persen)
    rekomendasi = get_rekomendasi(kategori)

    return {
        "risk_persen":        round(risk_persen, 2),
        "kategori_risiko":    kategori,
        "rekomendasi_risiko": rekomendasi
    }


# ── Prediksi Potensi Panen ─────────────────────────────────────────
def predict_panen(
    kapasitas_baglog: int,
    risk_persen: float
) -> float:
    """
    Prediksi potensi total hasil panen (kg).

    Formula empiris:
    - Rata-rata 1 baglog menghasilkan 0.4 kg jamur tiram per siklus
    - Faktor reduksi berdasarkan risk_persen dari Regresi Linear
    
    Contoh: 100 baglog, risk 20% → 100 × 0.4 × (1 - 0.20) = 32 kg
    """
    hasil_per_baglog = 0.4          # kg per baglog (rata-rata empiris jamur tiram)
    faktor_reduksi   = risk_persen / 100.0
    potensi_panen    = kapasitas_baglog * hasil_per_baglog * (1 - faktor_reduksi)
    return round(max(0.0, potensi_panen), 2)