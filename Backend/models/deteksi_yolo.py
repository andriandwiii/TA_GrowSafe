from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from database import Base

class DeteksiYolo(Base):
    __tablename__ = "deteksi_yolo"

    # Primary key internal (auto increment)
    id = Column(Integer, primary_key=True, autoincrement=True)

    # ID unik deteksi — dipakai untuk relasi ke tabel lain
    id_yolo = Column(String(15), nullable=False, unique=True)

    # Relasi ke kumbung menggunakan id_kumbung
    id_kumbung = Column(
        String(10),
        ForeignKey("kumbung.id_kumbung", ondelete="CASCADE"),
        nullable=False
    )

    # Hasil deteksi YOLO
    image_path            = Column(String(255), nullable=True)  # path file gambar
    confidence_score      = Column(Float,       nullable=True)  # keyakinan deteksi (0.0 - 1.0)
    infected_area_percent = Column(Float,       nullable=True)  # area terinfeksi (0.0 - 100.0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Index tambahan
    __table_args__ = (
        Index("ix_deteksi_yolo_id_yolo_id_kumbung", "id_yolo", "id_kumbung"),
    )