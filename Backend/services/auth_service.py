# ===================================================================
# File: auth_service.py
# Lokasi: GrowSafe/Backend/services/auth_service.py
# Deskripsi: Logika keamanan: hash password, verifikasi, JWT token.
# ===================================================================

import os
import secrets
from passlib.context        import CryptContext
from datetime               import datetime, timedelta, timezone
from jose                   import JWTError, jwt
from fastapi.security        import OAuth2PasswordBearer
from fastapi                import HTTPException, status
from dotenv                 import load_dotenv

# Load environment variables
load_dotenv()

# ── Konfigurasi Hash Password ──────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ── Konfigurasi JWT ────────────────────────────────────────────────
# SECRET_KEY WAJIB diset di file .env untuk keamanan.
# Tanpa SECRET_KEY yang kuat, token JWT bisa dipalsukan oleh pihak luar.
_secret_key_env = os.getenv("SECRET_KEY", "").strip()

if not _secret_key_env:
    # Jika SECRET_KEY kosong, generate random key untuk development saja.
    # PERINGATAN: key ini berubah setiap restart → semua token lama invalid.
    _secret_key_env = secrets.token_hex(32)
    print("=" * 60)
    print("⚠️  PERINGATAN KEAMANAN: SECRET_KEY tidak diset di .env!")
    print("   Menggunakan key random sementara (berubah tiap restart).")
    print("   Semua token login akan INVALID setelah server restart.")
    print("")
    print("   Solusi: Tambahkan baris berikut ke file .env Anda:")
    print(f'   SECRET_KEY="{secrets.token_hex(32)}"')
    print("=" * 60)

SECRET_KEY  = _secret_key_env
ALGORITHM   = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30  # token berlaku 30 hari

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def create_access_token(data: dict) -> str:
    """Buat JWT token dengan masa berlaku 30 hari."""
    to_encode = data.copy()
    expire    = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode dan validasi JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kadaluarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id_pengguna = payload.get("id_pengguna")
        if id_pengguna is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception