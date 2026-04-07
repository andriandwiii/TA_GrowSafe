# ===================================================================
# File: history_schema.py
# Lokasi: GuavaScan/Backend/schemas/history_schema.py
# Deskripsi: Mengubah skema untuk menangani rekomendasi terstruktur.
# ===================================================================
import json
from pydantic import BaseModel, field_validator # 1. Menggunakan field_validator
from datetime import datetime
from typing import Dict

# Skema detail untuk rekomendasi
class RecommendationDetail(BaseModel):
    organik: str
    kimiawi: str

class HistoryResponse(BaseModel):
    id_riwayat: int
    id_pengguna: int
    gambar_pindai: str
    hasil_diagnosis: str
    skor_keyakinan: float
    
    # Sekarang, rekomendasi akan menjadi objek/dictionary, bukan string.
    rekomendasi_penanganan: RecommendationDetail | None = None
    
    tanggal_pindai: datetime

    # 2. Menggunakan @field_validator dengan mode 'before' (pengganti pre=True)
    @field_validator('rekomendasi_penanganan', mode='before')
    def parse_recommendation(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return None # atau handle error
        return v

    class Config:
        # 3. Mengganti orm_mode yang sudah deprecated dengan from_attributes
        from_attributes = True
