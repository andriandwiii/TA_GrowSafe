# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables dari .env
load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "db_growsafe")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Konfigurasi Connection Pool untuk production / heavy IoT load
engine = create_engine(
    DATABASE_URL,
    pool_size=10,          # Simpan 10 koneksi stanby
    max_overflow=20,       # Izinkan tambahan 20 koneksi saat antrean penuh
    pool_recycle=3600,     # Refresh koneksi setiap 1 jam (mencegah timeout)
    pool_pre_ping=True     # Selalu test 'ping' DB sebelum eksekusi query
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()