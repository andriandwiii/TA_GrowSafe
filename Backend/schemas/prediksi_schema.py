from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

# ── Request: Jalankan Prediksi ─────────────────────────────────────
# Dikirim dari mobile setelah upload foto + data IoT sudah tersimpan
class PrediksiCreate(BaseModel):
    id_kumbung:            str
    id_yolo:               Optional[str]   = None  # hasil deteksi YOLO (opsional)
    suhu:                  float
    kelembaban:            float
    total_led_menyala:     int
    infected_area_percent: Optional[float] = 0.0   # dari YOLO, default 0 jika tidak ada

# ── Response: Hasil Prediksi ───────────────────────────────────────
class PrediksiResponse(BaseModel):
    id_prediksi:        str
    id_kumbung:         str
    risk_persen:        Optional[float] = None
    predicted_panen_kg: Optional[float] = None
    kategori_risiko:    Literal["Rendah", "Sedang", "Tinggi"]
    rekomendasi_risiko: Optional[str]   = None
    created_at:         datetime

    class Config:
        from_attributes = True

# ── Response: Ringkasan prediksi (untuk dashboard) ─────────────────
class PrediksiSummary(BaseModel):
    id_prediksi:        str
    risk_persen:        Optional[float] = None
    predicted_panen_kg: Optional[float] = None
    kategori_risiko:    Literal["Rendah", "Sedang", "Tinggi"]
    created_at:         datetime

    class Config:
        from_attributes = True