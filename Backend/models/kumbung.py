from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from database import Base

class Kumbung(Base):
    __tablename__ = "kumbung"

    # Primary key internal (auto increment)
    id = Column(Integer, primary_key=True, autoincrement=True)

    # ID unik kumbung — dipakai untuk relasi ke tabel lain
    id_kumbung = Column(String(10), nullable=False, unique=True)

    # Relasi ke users menggunakan id_pengguna (bukan id internal)
    id_pengguna = Column(
        String(10),
        ForeignKey("users.id_pengguna", ondelete="CASCADE"),
        nullable=False
    )

    # Data utama
    nama_kumbung         = Column(String(50),  nullable=False)
    lokasi               = Column(String(100), nullable=True)
    kapasitas_baglog     = Column(Integer,     nullable=True)
    waktu_mulai_budidaya = Column(Date,        nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Index tambahan
    __table_args__ = (
        Index("ix_kumbung_id_kumbung_id_pengguna", "id_kumbung", "id_pengguna"),
    )