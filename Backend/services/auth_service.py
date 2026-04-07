# ===================================================================
# File: auth_service.py
# Lokasi: GuavaScan/Backend/services/auth_service.py
# Deskripsi: Berisi semua logika bisnis untuk keamanan, seperti hashing
#            password dan pembuatan JSON Web Token (JWT).
# ===================================================================

from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

# --- Konfigurasi Hashing Password ---
# Mengatur konteks untuk hashing password, menggunakan algoritma bcrypt
# yang sangat aman dan direkomendasikan.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    """Fungsi untuk mengubah password teks biasa menjadi hash."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """
    Fungsi untuk memverifikasi apakah password teks biasa yang dimasukkan pengguna
    cocok dengan hash yang tersimpan di database.
    """
    return pwd_context.verify(plain_password, hashed_password)

# --- Konfigurasi JWT (JSON Web Token) ---
# PENTING: Ganti 'YOUR_SECRET_KEY' dengan string acak yang kuat dan rahasia.
# Anda bisa membuatnya di situs seperti: https://random.org/strings/
# Kunci ini digunakan untuk "menandatangani" token agar tidak bisa dipalsukan.
SECRET_KEY = "kgd8orawy9hvget3oxre1nq80jlm1ux7"
ALGORITHM = "HS256"

# Mengatur masa berlaku token menjadi 30 hari untuk sesi yang persisten.
# 30 hari * 24 jam * 60 menit = 43200 menit
ACCESS_TOKEN_EXPIRE_MINUTES = 43200 

def create_access_token(data: dict):
    """
    Fungsi untuk membuat satu access token yang berlaku lama.
    'data' yang dimasukkan biasanya berisi identitas pengguna (seperti username).
    """
    to_encode = data.copy()
    
    # Menetapkan waktu kedaluwarsa token
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Membuat token JWT yang sudah dienkode
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Skema keamanan ini digunakan oleh FastAPI untuk secara otomatis
# mengekstrak token dari header 'Authorization' pada setiap permintaan API
# yang memerlukan autentikasi.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
