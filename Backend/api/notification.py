from fastapi                      import APIRouter, Depends, HTTPException
from sqlalchemy.orm               import Session
from typing                       import List
from database                     import SessionLocal
from models.notifikasi            import Notifikasi
from schemas.notifikasi_schema    import NotifikasiResponse, NotifikasiUpdate
from api.auth                     import get_current_user, get_db
from models.user                  import Pengguna

router = APIRouter()


# ── GET /notification ──────────────────────────────────────────────
@router.get("/", response_model=List[NotifikasiResponse])
def list_notifikasi(
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil semua notifikasi milik pengguna, terbaru di atas."""
    return db.query(Notifikasi).filter(
        Notifikasi.id_pengguna == current_user.id_pengguna
    ).order_by(Notifikasi.created_at.desc()).all()


# ── GET /notification/unread ───────────────────────────────────────
@router.get("/unread", response_model=List[NotifikasiResponse])
def notifikasi_belum_dibaca(
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil notifikasi yang belum dibaca."""
    return db.query(Notifikasi).filter(
        Notifikasi.id_pengguna == current_user.id_pengguna,
        Notifikasi.status_baca == "Belum"
    ).order_by(Notifikasi.created_at.desc()).all()


# ── PUT /notification/{id_notifikasi}/read ─────────────────────────
@router.put("/{id_notifikasi}/read", response_model=NotifikasiResponse)
def tandai_sudah_dibaca(
    id_notifikasi: str,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Tandai satu notifikasi sebagai sudah dibaca."""
    notif = db.query(Notifikasi).filter(
        Notifikasi.id_notifikasi == id_notifikasi,
        Notifikasi.id_pengguna   == current_user.id_pengguna
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")

    notif.status_baca = "Sudah"
    db.commit()
    db.refresh(notif)
    return notif


# ── PUT /notification/read-all ─────────────────────────────────────
@router.put("/read-all", status_code=200)
def tandai_semua_dibaca(
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Tandai semua notifikasi sebagai sudah dibaca."""
    db.query(Notifikasi).filter(
        Notifikasi.id_pengguna == current_user.id_pengguna,
        Notifikasi.status_baca == "Belum"
    ).update({"status_baca": "Sudah"})
    db.commit()
    return {"message": "Semua notifikasi telah ditandai sebagai dibaca"}


# ── DELETE /notification/{id_notifikasi} ───────────────────────────
@router.delete("/{id_notifikasi}", status_code=200)
def hapus_notifikasi(
    id_notifikasi: str,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Hapus satu notifikasi."""
    notif = db.query(Notifikasi).filter(
        Notifikasi.id_notifikasi == id_notifikasi,
        Notifikasi.id_pengguna   == current_user.id_pengguna
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")

    db.delete(notif)
    db.commit()
    return {"message": "Notifikasi berhasil dihapus"}