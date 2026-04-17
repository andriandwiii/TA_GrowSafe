from fastapi                  import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm           import Session
from typing                   import List
from database                 import SessionLocal
from models.kumbung           import Kumbung
from schemas.kumbung_schema   import KumbungCreate, KumbungUpdate, KumbungResponse
from services.id_generator    import generate_id_kumbung
from api.auth                 import get_current_user, get_db
from models.user              import Pengguna

router = APIRouter()


# ── POST /kumbung ──────────────────────────────────────────────────
@router.post("/", response_model=KumbungResponse, status_code=201)
def buat_kumbung(
    data: KumbungCreate,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Buat kumbung baru milik pengguna yang sedang login."""

    # Cek nama kumbung tidak duplikat untuk user yang sama
    existing = db.query(Kumbung).filter(
        Kumbung.id_pengguna  == current_user.id_pengguna,
        Kumbung.nama_kumbung == data.nama_kumbung
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Nama kumbung sudah digunakan")

    kumbung = Kumbung(
        id_kumbung           = generate_id_kumbung(db),
        id_pengguna          = current_user.id_pengguna,
        nama_kumbung         = data.nama_kumbung,
        lokasi               = data.lokasi,
        kapasitas_baglog     = data.kapasitas_baglog,
        waktu_mulai_budidaya = data.waktu_mulai_budidaya
    )
    db.add(kumbung)
    db.commit()
    db.refresh(kumbung)
    return kumbung


# ── GET /kumbung ───────────────────────────────────────────────────
@router.get("/", response_model=List[KumbungResponse])
def list_kumbung(
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil semua kumbung milik pengguna yang sedang login."""
    return db.query(Kumbung).filter(
        Kumbung.id_pengguna == current_user.id_pengguna
    ).all()


# ── GET /kumbung/{id_kumbung} ──────────────────────────────────────
@router.get("/{id_kumbung}", response_model=KumbungResponse)
def detail_kumbung(
    id_kumbung: str,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil detail satu kumbung."""
    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")
    return kumbung


# ── PUT /kumbung/{id_kumbung} ──────────────────────────────────────
@router.put("/{id_kumbung}", response_model=KumbungResponse)
def update_kumbung(
    id_kumbung: str,
    data: KumbungUpdate,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Update data kumbung."""
    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    if data.nama_kumbung:         kumbung.nama_kumbung         = data.nama_kumbung
    if data.lokasi:               kumbung.lokasi               = data.lokasi
    if data.kapasitas_baglog:     kumbung.kapasitas_baglog     = data.kapasitas_baglog
    if data.waktu_mulai_budidaya: kumbung.waktu_mulai_budidaya = data.waktu_mulai_budidaya

    db.commit()
    db.refresh(kumbung)
    return kumbung


# ── DELETE /kumbung/{id_kumbung} ───────────────────────────────────
@router.delete("/{id_kumbung}", status_code=200)
def hapus_kumbung(
    id_kumbung: str,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Hapus kumbung beserta semua datanya (cascade)."""
    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    db.delete(kumbung)
    db.commit()
    return {"message": f"Kumbung '{kumbung.nama_kumbung}' berhasil dihapus"}