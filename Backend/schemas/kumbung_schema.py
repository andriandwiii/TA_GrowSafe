from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# ── Request: Buat Kumbung Baru ─────────────────────────────────────
class KumbungCreate(BaseModel):
    nama_kumbung:         str
    lokasi:               Optional[str]  = None
    kapasitas_baglog:     Optional[int]  = None
    waktu_mulai_budidaya: Optional[date] = None

# ── Request: Update Kumbung ────────────────────────────────────────
class KumbungUpdate(BaseModel):
    nama_kumbung:         Optional[str]  = None
    lokasi:               Optional[str]  = None
    kapasitas_baglog:     Optional[int]  = None
    waktu_mulai_budidaya: Optional[date] = None

# ── Response: Data Kumbung ─────────────────────────────────────────
class KumbungResponse(BaseModel):
    id_kumbung:           str
    id_pengguna:          str
    nama_kumbung:         str
    lokasi:               Optional[str]  = None
    kapasitas_baglog:     Optional[int]  = None
    waktu_mulai_budidaya: Optional[date] = None
    created_at:           datetime

    class Config:
        from_attributes = True