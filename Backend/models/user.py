# ===================================================================
# File: user.py
# Lokasi: GuavaScan/Backend/models/user.py
# Deskripsi: Model data SQLAlchemy untuk tabel 'pengguna'.
# ===================================================================

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base # Mengimpor Base dari file database.py

class Pengguna(Base):
    """
    Kelas model ini merepresentasikan tabel 'pengguna' di dalam database.
    SQLAlchemy akan menggunakan definisi ini untuk membuat dan berinteraksi
    dengan tabel tersebut.
    """
    __tablename__ = "pengguna" # Nama tabel di database

    # Mendefinisikan kolom-kolom pada tabel
    id_pengguna = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    
    # Kolom password akan menyimpan kata sandi yang sudah di-hash, bukan teks asli.
    password = Column(String(255), nullable=False)
    
    # Kolom ini akan secara otomatis diisi dengan tanggal dan waktu saat
    # data pertama kali dibuat.
    tanggal_dibuat = Column(DateTime(timezone=True), server_default=func.now())

