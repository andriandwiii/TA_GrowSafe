# ===================================================================
# File: auth_service.py
# Lokasi: GrowSafe/Backend/services/auth_service.py
# Deskripsi: Logika keamanan: hash password, verifikasi, JWT token.
# ===================================================================

from passlib.context        import CryptContext
from datetime               import datetime, timedelta, timezone
from jose                   import JWTError, jwt
from fastapi.security        import OAuth2PasswordBearer
from fastapi                import HTTPException, status

# ── Konfigurasi Hash Password ──────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ── Konfigurasi JWT ────────────────────────────────────────────────
# Ganti SECRET_KEY dengan string acak yang kuat di environment production
SECRET_KEY  = "growsafe-secret-key-ganti-ini-di-production"
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
        id_pengguna: str = payload.get("id_pengguna")
        if id_pengguna is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception