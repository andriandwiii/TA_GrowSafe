# ===================================================================
# File: database.py
# Lokasi: GuavaScan/Backend/database.py
# Deskripsi: Mengelola koneksi dan sesi database menggunakan SQLAlchemy untuk MySQL.
# ===================================================================

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- Konfigurasi URL Database untuk MySQL ---
DB_USER = "root"      # Ganti dengan username database Anda
DB_PASSWORD = ""      # Ganti dengan password database Anda
DB_HOST = "localhost" # Ganti dengan host database Anda (biasanya localhost)
DB_NAME = "guavascan_db" # Ganti dengan nama database Anda

# URL untuk koneksi ke database MySQL menggunakan driver PyMySQL.
# Format: "mysql+pymysql://<user>:<password>@<host>/<dbname>"
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Membuat engine SQLAlchemy, yang merupakan titik awal koneksi ke database.
engine = create_engine(DATABASE_URL)

# Membuat kelas SessionLocal yang akan kita gunakan untuk membuat sesi database
# di setiap permintaan API.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Membuat kelas Base. Semua kelas model data (seperti Pengguna, RiwayatPindai)
# akan mewarisi (inherit) dari kelas Base ini.
Base = declarative_base()
