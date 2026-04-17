from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ── Response: Hasil Deteksi YOLO ───────────────────────────────────
class DeteksiResponse(BaseModel):
    id_yolo:               str
    id_kumbung:            str
    image_path:            Optional[str]   = None
    confidence_score:      Optional[float] = None  # 0.0 - 1.0
    infected_area_percent: Optional[float] = None  # 0.0 - 100.0
    created_at:            datetime

    class Config:
        from_attributes = True

# ── Response: Ringkasan hasil deteksi (untuk tampil di mobile) ─────
class DeteksiSummary(BaseModel):
    id_yolo:               str
    confidence_score:      Optional[float] = None
    infected_area_percent: Optional[float] = None
    created_at:            datetime

    class Config:
        from_attributes = True