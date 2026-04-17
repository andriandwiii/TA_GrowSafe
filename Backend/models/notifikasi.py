from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Index
from sqlalchemy.sql import func
from database import Base

class Notifikasi(Base):
    __tablename__ = "notifikasi"

    # Primary key internal (auto increment)
    id = Column(Integer, primary_key=True, autoincrement=True)

    # ID unik notifikasi
    id_notifikasi = Column(String(15), nullable=False, unique=True)

    # Relasi ke users menggunakan id_pengguna
    id_pengguna = Column(
        String(10),
        ForeignKey("users.id_pengguna", ondelete="CASCADE"),
        nullable=False
    )

    # Relasi ke prediksi menggunakan id_prediksi
    id_prediksi = Column(
        String(15),
        ForeignKey("prediksi.id_prediksi", ondelete="CASCADE"),
        nullable=False
    )

    # Isi notifikasi
    judul       = Column(String(100), nullable=True)
    isi         = Column(Text,        nullable=True)
    status_baca = Column(
        Enum("Belum", "Sudah"),
        nullable=False,
        default="Belum"
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Index tambahan
    __table_args__ = (
        Index("ix_notifikasi_id_notifikasi_id_pengguna", "id_notifikasi", "id_pengguna"),
    )