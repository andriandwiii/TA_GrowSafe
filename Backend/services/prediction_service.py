import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pickle
import numpy as np
from PIL import Image
from services.recommendation_service import tentukan_kategori, get_rekomendasi

# ── Path model ────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH     = os.path.join(BASE_DIR, "models_ml", "regression_model.pkl")
SCALER_PATH    = os.path.join(BASE_DIR, "models_ml", "scaler.pkl")

# ── Load Model YOLO ───────────────────────────────────────────────
try:
    from ultralytics import YOLO
    YOLO_PATH  = os.path.join(BASE_DIR, "best.pt")
    yolo_model = YOLO(YOLO_PATH)
    print("✅ Model YOLO berhasil dimuat.")
except Exception as e:
    yolo_model = None
    print(f"⚠️  Model YOLO tidak tersedia: {e}")

# ── Load Model Regresi Linear + Scaler ───────────────────────────
try:
    with open(MODEL_PATH,  "rb") as f: regression_model = pickle.load(f)
    with open(SCALER_PATH, "rb") as f: scaler           = pickle.load(f)
    print("✅ Model Regresi Linear & Scaler berhasil dimuat.")
except Exception as e:
    regression_model = None
    scaler           = None
    print(f"⚠️  Model Regresi Linear tidak tersedia: {e}")


# ── Deteksi YOLO ──────────────────────────────────────────────────
def run_yolo_detection(image: Image.Image) -> dict:
    """Jalankan YOLO pada foto baglog. Return confidence & infected area."""
    if yolo_model is None:
        return {"confidence_score": 0.0, "infected_area_percent": 0.0}
    try:
        results = yolo_model(image)
        if not results or len(results[0].boxes) == 0:
            return {"confidence_score": 0.0, "infected_area_percent": 0.0}
        boxes    = results[0].boxes
        best     = max(boxes, key=lambda b: float(b.conf))
        conf     = float(best.conf)
        w, h     = image.size
        x1,y1,x2,y2 = best.xyxy[0].tolist()
        infected = round(((x2-x1)*(y2-y1)) / (w*h) * 100, 2) if w*h > 0 else 0.0
        return {"confidence_score": round(conf, 4), "infected_area_percent": infected}
    except Exception as e:
        print(f"⚠️  Error YOLO: {e}")
        return {"confidence_score": 0.0, "infected_area_percent": 0.0}


# ── Prediksi Risiko Black Mold ────────────────────────────────────
def predict_risk(
    suhu: float,
    kelembaban: float,
    total_led_menyala: int,
    infected_area_percent: float = 0.0
) -> dict:
    """
    Prediksi risiko black mold menggunakan model Regresi Linear.

    Input:
      - suhu                 : suhu kumbung (°C)
      - kelembaban           : kelembaban kumbung (%)
      - total_led_menyala    : durasi aktor menyala (menit)
      - infected_area_percent: % area terinfeksi dari YOLO (0-100)

    Output:
      - risk_persen        : 0.0 - 100.0
      - kategori_risiko    : Rendah / Sedang / Tinggi
      - rekomendasi_risiko : teks rekomendasi penanganan
    """
    if regression_model is not None and scaler is not None:
        # ── Pakai model yang sudah dilatih ────
        features    = pd.DataFrame([[suhu, kelembaban, total_led_menyala, infected_area_percent]],
                                    columns=["suhu","kelembaban","total_led_menyala","infected_area_percent"])
        scaled      = scaler.transform(features)
        risk_persen = float(regression_model.predict(scaled)[0])
        risk_persen = float(np.clip(risk_persen, 0.0, 100.0))
    else:
        # ── Fallback formula manual ───────────
        def fsuhu(s):
            if 22 <= s <= 28: return 0.0
            return (22 - s) * 3.0 if s < 22 else (s - 28) * 5.5
        def fkelembaban(k):
            if 80 <= k <= 90: return 0.0
            return (80 - k) * 0.8 if k < 80 else (k - 90) * 1.5

        risk_persen = float(np.clip(
            fsuhu(suhu) * 1.2 +
            fkelembaban(kelembaban) * 1.5 +
            total_led_menyala * 0.08 +
            infected_area_percent * 0.9,
            0.0, 100.0
        ))

    kategori    = tentukan_kategori(risk_persen)
    rekomendasi = get_rekomendasi(kategori)

    return {
        "risk_persen":        round(risk_persen, 2),
        "kategori_risiko":    kategori,
        "rekomendasi_risiko": rekomendasi
    }


# ── Prediksi Potensi Panen ────────────────────────────────────────
def predict_panen(kapasitas_baglog: int, risk_persen: float) -> float:
    """
    Prediksi potensi total panen (kg).
    Formula: baglog × 0.4kg × (1 - risk%)
    Rata-rata 1 baglog jamur tiram menghasilkan 0.4 kg per siklus.
    """
    hasil = kapasitas_baglog * 0.4 * (1 - risk_persen / 100.0)
    return round(max(0.0, hasil), 2)


# import pandas di sini agar tidak error saat fallback
try:
    import pandas as pd
except ImportError:
    pass