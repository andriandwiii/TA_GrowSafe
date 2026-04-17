from fastapi                  import APIRouter, Depends, HTTPException
from sqlalchemy.orm           import Session
from typing                   import List
from database                 import SessionLocal
from models.deteksi_yolo      import DeteksiYolo
from models.prediksi          import Prediksi
from models.kumbung           import Kumbung
from schemas.deteksi_schema   import DeteksiResponse
from schemas.prediksi_schema  import PrediksiResponse
from api.auth                 import get_current_user, get_db
from models.user              import Pengguna

router = APIRouter()


# ── GET /history/deteksi/{id_kumbung} ─────────────────────────────
@router.get("/deteksi/{id_kumbung}", response_model=List[DeteksiResponse])
def riwayat_deteksi(
    id_kumbung: str,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil riwayat deteksi YOLO untuk kumbung tertentu."""

    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    return db.query(DeteksiYolo).filter(
        DeteksiYolo.id_kumbung == id_kumbung
    ).order_by(DeteksiYolo.created_at.desc()).limit(limit).all()


# ── GET /history/prediksi/{id_kumbung} ────────────────────────────
@router.get("/prediksi/{id_kumbung}", response_model=List[PrediksiResponse])
def riwayat_prediksi(
    id_kumbung: str,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil riwayat prediksi risiko + panen untuk kumbung tertentu."""

    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    return db.query(Prediksi).filter(
        Prediksi.id_kumbung == id_kumbung
    ).order_by(Prediksi.created_at.desc()).limit(limit).all()


# ── GET /history/prediksi/{id_kumbung}/latest ─────────────────────
@router.get("/prediksi/{id_kumbung}/latest", response_model=PrediksiResponse)
def prediksi_terbaru(
    id_kumbung: str,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil hasil prediksi terbaru untuk ditampilkan di dashboard."""

    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    latest = db.query(Prediksi).filter(
        Prediksi.id_kumbung == id_kumbung
    ).order_by(Prediksi.created_at.desc()).first()

    if not latest:
        raise HTTPException(status_code=404, detail="Belum ada data prediksi")

    return latest