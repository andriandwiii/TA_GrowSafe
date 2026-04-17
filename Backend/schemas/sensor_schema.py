from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ── Request: Kirim Data Sensor dari IoT (ESP32) ────────────────────
class SensorCreate(BaseModel):
    id_kumbung:        str
    suhu:              Optional[float] = None  # derajat Celsius
    kelembaban:        Optional[float] = None  # persen (%)
    total_led_menyala: Optional[int]   = None  # durasi aktor menyala (menit)

# ── Response: Data Sensor ──────────────────────────────────────────
class SensorResponse(BaseModel):
    id_sensor:         str
    id_kumbung:        str
    suhu:              Optional[float] = None
    kelembaban:        Optional[float] = None
    total_led_menyala: Optional[int]   = None
    created_at:        datetime

    class Config:
        from_attributes = True

# ── Response: Data Sensor Terbaru (untuk dashboard) ───────────────
class SensorLatestResponse(BaseModel):
    id_kumbung:        str
    suhu:              Optional[float] = None
    kelembaban:        Optional[float] = None
    total_led_menyala: Optional[int]   = None
    waktu_baca:        datetime

    class Config:
        from_attributes = True