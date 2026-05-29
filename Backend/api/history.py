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


# ── GET /history/prediksi/detail/{id_prediksi} ────────────────────
@router.get("/prediksi/detail/{id_prediksi}", response_model=PrediksiResponse)
def detail_prediksi(
    id_prediksi: str,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil detail satu prediksi spesifik berdasarkan ID."""
    prediksi = db.query(Prediksi).filter(Prediksi.id_prediksi == id_prediksi).first()
    if not prediksi:
        raise HTTPException(status_code=404, detail="Data prediksi tidak ditemukan")
        
    # Validasi kepemilikan kumbung
    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung == prediksi.id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke data ini")

    return prediksi

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


# ── DELETE /history/deteksi/{id_yolo} ─────────────────────────────
@router.delete("/deteksi/{id_yolo}")
def hapus_riwayat_deteksi(
    id_yolo: str,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Hapus satu riwayat deteksi YOLO."""
    deteksi = db.query(DeteksiYolo).filter(DeteksiYolo.id_yolo == id_yolo).first()
    if not deteksi:
        raise HTTPException(status_code=404, detail="Data deteksi tidak ditemukan")
        
    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung == deteksi.id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    # Opsional: Hapus file gambar dari server jika mau
    import os
    if deteksi.image_path:
        img_path = str(deteksi.image_path)
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except:
                pass

    db.delete(deteksi)
    db.commit()
    return {"message": "Riwayat deteksi berhasil dihapus"}


# ── DELETE /history/prediksi/{id_prediksi} ────────────────────────
@router.delete("/prediksi/{id_prediksi}")
def hapus_riwayat_prediksi(
    id_prediksi: str,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Hapus satu riwayat prediksi panen."""
    prediksi = db.query(Prediksi).filter(Prediksi.id_prediksi == id_prediksi).first()
    if not prediksi:
        raise HTTPException(status_code=404, detail="Data prediksi tidak ditemukan")
        
    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung == prediksi.id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    db.delete(prediksi)
    db.commit()
    return {"message": "Riwayat prediksi berhasil dihapus"}