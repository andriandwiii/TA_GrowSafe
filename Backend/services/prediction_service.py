import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pickle
import numpy as np
import pandas as pd
from PIL import Image
from services.recommendation_service import tentukan_kategori, get_rekomendasi

# ── Path model ────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH     = os.path.join(BASE_DIR, "models_ml", "regression_model.pkl")
SCALER_PATH    = os.path.join(BASE_DIR, "models_ml", "scaler.pkl")
POLY_PATH      = os.path.join(BASE_DIR, "models_ml", "poly_features.pkl")

# ── Encoding fase pertumbuhan ─────────────────────────────────────
# Harus sama dengan yang digunakan saat training di train_model.py
FASE_ENCODING = {
    "Inkubasi":  0,
    "Primordia": 1,
    "Produksi":  2
}

# ── Load Model YOLO ───────────────────────────────────────────────
try:
    from ultralytics import YOLO
    YOLO_PATH  = os.path.join(BASE_DIR, "best.pt")
    yolo_model = YOLO(YOLO_PATH)
    print("✅ Model YOLO berhasil dimuat.")
except Exception as e:
    yolo_model = None
    print(f"⚠️  Model YOLO tidak tersedia: {e}")

# ── Load Model Regresi Linear + Scaler + PolynomialFeatures ──────
try:
    with open(MODEL_PATH,  "rb") as f: regression_model = pickle.load(f)
    with open(SCALER_PATH, "rb") as f: scaler           = pickle.load(f)
    with open(POLY_PATH,   "rb") as f: poly_transformer  = pickle.load(f)
    print("✅ Model Regresi Linear (Polynomial) & Scaler berhasil dimuat.")
except Exception as e:
    regression_model  = None
    scaler            = None
    poly_transformer  = None
    print(f"⚠️  Model Regresi Linear tidak tersedia: {e}")


# ── Deteksi YOLO ──────────────────────────────────────────────────
def run_yolo_detection(image: Image.Image) -> dict:
    """
    Jalankan YOLO pada foto baglog.
    Menghitung TOTAL area terinfeksi dari SEMUA bounding box yang terdeteksi,
    bukan hanya 1 box dengan confidence tertinggi.
    """
    if yolo_model is None:
        return {"confidence_score": 0.0, "infected_area_percent": 0.0, "plotted_image": None}
    try:
        results = yolo_model(image, conf=0.10)
        if not results or len(results[0].boxes) == 0:
            return {"confidence_score": 0.0, "infected_area_percent": 0.0, "plotted_image": None}

        boxes = results[0].boxes
        w, h  = image.size
        total_image_area = w * h

        # ── Hitung total area terinfeksi tanpa overlap (Union Area) ──
        max_conf = 0.0
        # Buat canvas/mask kosong berukuran gambar (2D array)
        # Menggunakan np.uint8 sangat ringan memori
        mask = np.zeros((h, w), dtype=np.uint8)

        for box in boxes:
            class_id = int(box.cls[0])
            class_name = yolo_model.names[class_id].lower()
            
            # Abaikan kotak yang berlabel "healthy" atau "sehat"
            if "healthy" in class_name or "sehat" in class_name:
                continue
                
            conf = float(box.conf)
            max_conf = max(max_conf, conf)
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            # Konversi koordinat ke integer (batas piksel)
            x1_idx = max(0, int(x1))
            y1_idx = max(0, int(y1))
            x2_idx = min(w, int(x2))
            y2_idx = min(h, int(y2))
            
            # Tandai piksel yang berada dalam kotak sebagai 1 (terinfeksi)
            mask[y1_idx:y2_idx, x1_idx:x2_idx] = 1

        # Jumlahkan seluruh piksel yang bernilai 1 (area gabungan murni)
        total_infected_area = np.sum(mask)

        # Hitung persentase murni tanpa nilai lebih dari 100%
        infected = round((total_infected_area / total_image_area) * 100, 2) if total_image_area > 0 else 0.0

        # ── Dapatkan gambar dengan Bounding Box ──
        res_plotted = results[0].plot() # numpy array (BGR format)
        plotted_img = Image.fromarray(res_plotted[..., ::-1]) # Convert BGR ke RGB PIL Image

        return {
            "confidence_score": round(max_conf, 4),
            "infected_area_percent": infected,
            "plotted_image": plotted_img
        }
    except Exception as e:
        print(f"⚠️  Error YOLO: {e}")
        return {"confidence_score": 0.0, "infected_area_percent": 0.0, "plotted_image": None}


# ── Prediksi Risiko Black Mold ────────────────────────────────────
def predict_risk(
    suhu: float,
    kelembaban: float,
    total_led_menyala: int,
    infected_area_percent: float = 0.0,
    fase: str = "Produksi"
) -> dict:
    """
    Prediksi risiko black mold menggunakan model Regresi Linear
    dengan Polynomial Features (degree=2).

    Input:
      - suhu                 : suhu kumbung (°C)
      - kelembaban           : kelembaban kumbung (%)
      - total_led_menyala    : durasi aktor menyala (menit)
      - infected_area_percent: % area terinfeksi dari YOLO (0-100)
      - fase                 : fase pertumbuhan (Inkubasi/Primordia/Produksi)

    Output:
      - risk_persen        : 0.0 - 100.0
      - kategori_risiko    : Rendah / Sedang / Tinggi
      - rekomendasi_risiko : teks rekomendasi penanganan
    """
    if regression_model is not None and scaler is not None and poly_transformer is not None:
        # ── Pakai model Polynomial Regression ────
        fase_encoded = FASE_ENCODING.get(fase, 2)  # Default: Produksi
        features = np.array([[suhu, kelembaban, total_led_menyala, infected_area_percent, fase_encoded]])

        # Langkah: fitur asli → polynomial features → scaling → prediksi
        features_poly  = poly_transformer.transform(features)
        features_scaled = scaler.transform(features_poly)
        risk_persen = float(regression_model.predict(features_scaled)[0])
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
    Prediksi potensi panen dengan dampak risiko non-linear.
    Risk rendah: dampak minimal. Risk tinggi: dampak eksponensial.
    """
    produktivitas = 0.4  # kg per baglog per siklus
    
    # Non-linear: (1 - (risk/100)^1.5)
    # Risk 10% → faktor 0.968 (hampir tidak berpengaruh)
    # Risk 50% → faktor 0.646 (berdampak sedang)
    # Risk 90% → faktor 0.146 (sangat berdampak)
    risk_factor = max(0.0, 1.0 - (risk_persen / 100.0) ** 1.5)
    
    hasil = kapasitas_baglog * produktivitas * risk_factor
    return round(max(0.0, hasil), 2)