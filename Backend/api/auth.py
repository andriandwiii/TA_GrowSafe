# ===================================================================
# File: auth.py
# Lokasi: GuavaScan/Backend/api/auth.py
# Deskripsi: Berisi endpoint API untuk register dan login pengguna.
# ===================================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_ # <-- 1. Impor 'or_' dari SQLAlchemy
from database import SessionLocal
from models import user as user_model
from schemas import user_schema
from services import auth_service
from fastapi.security import OAuth2PasswordRequestForm

# Membuat instance router baru. Semua endpoint di file ini akan
# menjadi bagian dari router ini.
router = APIRouter()

# Dependency untuk mendapatkan sesi database pada setiap permintaan.
# Ini adalah pola standar di FastAPI untuk memastikan koneksi database
# selalu dibuka dan ditutup dengan benar.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=user_schema.UserResponse)
def register_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint untuk mendaftarkan pengguna baru.
    - Menerima data sesuai skema UserCreate (username, email, password).
    - Mengembalikan data sesuai skema UserResponse (tanpa password).
    """
    # Cek apakah email sudah ada di database untuk mencegah duplikasi.
    db_user_email = db.query(user_model.Pengguna).filter(user_model.Pengguna.email == user.email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    # Cek apakah username sudah ada di database.
    db_user_username = db.query(user_model.Pengguna).filter(user_model.Pengguna.username == user.username).first()
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username sudah terdaftar")

    # Memanggil service untuk melakukan hashing password sebelum disimpan.
    hashed_password = auth_service.hash_password(user.password)
    
    # Membuat objek model Pengguna baru dengan password yang sudah di-hash.
    db_user = user_model.Pengguna(
        username=user.username,
        email=user.email,
        password=hashed_password
    )
    
    # Menambahkan dan menyimpan pengguna baru ke database.
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=user_schema.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint untuk login dan mendapatkan token JWT.
    - Menggunakan OAuth2PasswordRequestForm untuk menerima data form (username & password).
    - Mengembalikan access_token jika login berhasil.
    """
    # ================== PERUBAHAN UTAMA DI SINI ==================
    # Mencari pengguna berdasarkan username ATAU email.
    user = db.query(user_model.Pengguna).filter(
        or_(user_model.Pengguna.username == form_data.username, user_model.Pengguna.email == form_data.username)
    ).first()
    # ===========================================================
    
    # Jika pengguna tidak ditemukan atau password salah, kembalikan error "Unauthorized".
    if not user or not auth_service.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Jika berhasil, buat token akses yang berisi identitas pengguna.
    access_token = auth_service.create_access_token(
        data={"sub": user.username, "user_id": user.id_pengguna}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
