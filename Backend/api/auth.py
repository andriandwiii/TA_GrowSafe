from fastapi              import APIRouter, Depends, HTTPException, status
from fastapi.security     import OAuth2PasswordRequestForm
from sqlalchemy.orm       import Session
from database             import SessionLocal
from models.user          import Pengguna
from schemas.user_schema  import UserCreate, UserResponse, Token, UserUpdate
from services             import auth_service
from services.id_generator import generate_id_pengguna

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(auth_service.oauth2_scheme),
    db: Session = Depends(get_db)
) -> Pengguna:
    """Dependency: ambil user yang sedang login dari token JWT."""
    payload     = auth_service.decode_token(token)
    id_pengguna = payload.get("id_pengguna")
    user        = db.query(Pengguna).filter(Pengguna.id_pengguna == id_pengguna).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    return user


# ── POST /auth/register ────────────────────────────────────────────
@router.post("/register", response_model=UserResponse, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Daftarkan pengguna baru."""

    # Cek duplikasi email
    if db.query(Pengguna).filter(Pengguna.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    # Cek duplikasi username
    if db.query(Pengguna).filter(Pengguna.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username sudah digunakan")

    new_user = Pengguna(
        id_pengguna = generate_id_pengguna(db),
        nama        = user.nama,
        username    = user.username,
        email       = user.email,
        password    = auth_service.hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ── POST /auth/login ───────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login dengan username atau email dan password."""

    # Cari user berdasarkan username atau email
    user = db.query(Pengguna).filter(
        (Pengguna.username == form_data.username) |
        (Pengguna.email    == form_data.username)
    ).first()

    if not user or not auth_service.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username/email atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_service.create_access_token(data={
        "id_pengguna": user.id_pengguna,
        "username":    user.username
    })

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user":         user
    }


# ── GET /auth/me ───────────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
def get_profile(current_user: Pengguna = Depends(get_current_user)):
    """Ambil data profil pengguna yang sedang login."""
    return current_user


# ── PUT /auth/me ───────────────────────────────────────────────────
@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Update profil pengguna (nama, username, email, password)."""

    if data.nama:
        current_user.nama = data.nama

    if data.username:
        existing = db.query(Pengguna).filter(
            Pengguna.username == data.username,
            Pengguna.id_pengguna != current_user.id_pengguna
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username sudah digunakan")
        current_user.username = data.username

    if data.email:
        existing = db.query(Pengguna).filter(
            Pengguna.email == data.email,
            Pengguna.id_pengguna != current_user.id_pengguna
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")
        current_user.email = data.email

    if data.password:
        current_user.password = auth_service.hash_password(data.password)

    db.commit()
    db.refresh(current_user)
    return current_user