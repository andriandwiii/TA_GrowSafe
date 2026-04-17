from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.sql import func
from database import Base

class Pengguna(Base):
    __tablename__ = "users"

    # Primary key internal (auto increment)
    id = Column(Integer, primary_key=True, autoincrement=True)

    # ID unik pengguna — dipakai untuk relasi ke tabel lain
    id_pengguna = Column(String(10), nullable=False, unique=True)

    # Data utama
    nama     = Column(String(100), nullable=False)
    username = Column(String(50),  nullable=False, unique=True)
    email    = Column(String(100), nullable=False, unique=True)
    password = Column(String(255), nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Index tambahan
    __table_args__ = (
        Index("ix_users_id_pengguna_username", "id_pengguna", "username"),
    )