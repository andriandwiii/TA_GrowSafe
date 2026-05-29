from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

# ── Response: Data Notifikasi ──────────────────────────────────────
class NotifikasiResponse(BaseModel):
    id_notifikasi: str
    id_pengguna:   str
    id_prediksi:   str
    judul:         Optional[str] = None
    isi:           Optional[str] = None
    status_baca:   Literal["Belum", "Sudah"]
    created_at:    datetime
    kategori:      str

    class Config:
        from_attributes = True

# ── Request: Update status baca notifikasi ─────────────────────────
class NotifikasiUpdate(BaseModel):
    status_baca: Literal["Belum", "Sudah"]