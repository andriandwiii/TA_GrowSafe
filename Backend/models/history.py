# ===================================================================
# File: history.py
# Lokasi: GuavaScan/Backend/models/history.py
# Deskripsi: Mengubah tipe data kolom rekomendasi menjadi TEXT
#            untuk menyimpan data JSON.
# ===================================================================

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, TEXT
from sqlalchemy.sql import func
from database import Base

class RiwayatPindai(Base):
    __tablename__ = "riwayat_pindai"

    id_riwayat = Column(Integer, primary_key=True, index=True)
    id_pengguna = Column(Integer, ForeignKey("pengguna.id_pengguna"), nullable=False)
    gambar_pindai = Column(String(255), nullable=False)
    hasil_diagnosis = Column(String(255), nullable=False)
    skor_keyakinan = Column(Float, nullable=False)
    
    # Menggunakan tipe data TEXT yang lebih fleksibel untuk menyimpan
    # string JSON yang bisa jadi cukup panjang.
    rekomendasi_penanganan = Column(TEXT) 
    
    tanggal_pindai = Column(DateTime(timezone=True), server_default=func.now())
