from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Enum, ForeignKey, Index
from sqlalchemy.sql import func
from database import Base

class Prediksi(Base):
    __tablename__ = "prediksi"

    # Primary key internal (auto increment)
    id = Column(Integer, primary_key=True, autoincrement=True)

    # ID unik prediksi — dipakai untuk relasi ke tabel notifikasi
    id_prediksi = Column(String(15), nullable=False, unique=True)

    # Relasi ke kumbung menggunakan id_kumbung
    id_kumbung = Column(
        String(10),
        ForeignKey("kumbung.id_kumbung", ondelete="CASCADE"),
        nullable=False
    )

    # Hasil Model Regresi Linear
    risk_persen        = Column(Float, nullable=True)   # 0.00 - 100.00
    predicted_panen_kg = Column(Float, nullable=True)   # estimasi panen (kg)
    kategori_risiko    = Column(
        Enum("Rendah", "Sedang", "Tinggi"),
        nullable=False,
        default="Rendah"
    )
    rekomendasi_risiko = Column(Text, nullable=True)    # teks rekomendasi penanganan

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Index tambahan
    __table_args__ = (
        Index("ix_prediksi_id_prediksi_id_kumbung", "id_prediksi", "id_kumbung"),
    )