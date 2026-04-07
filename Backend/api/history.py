# ===================================================================
# File: history.py (Diperbarui)
# Lokasi: GuavaScan/Backend/api/history.py
# Deskripsi: Endpoint API untuk mengelola riwayat, kini dengan
#            logika untuk menghapus file gambar fisik.
# ===================================================================

import os # <-- 1. Impor library 'os' untuk berinteraksi dengan file sistem
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models import history as history_model
from schemas import history_schema
from services import auth_service
from database import SessionLocal

router = APIRouter()

# Dependency untuk mendapatkan sesi database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Mengimpor dependency get_current_user dari file predict.py
from .predict import get_current_user 

@router.get("/", response_model=List[history_schema.HistoryResponse])
def get_user_history(
    db: Session = Depends(get_db), 
    current_user_id: int = Depends(get_current_user)
):
    """
    Endpoint untuk mengambil semua riwayat pemindaian milik pengguna yang sedang login.
    """
    history = db.query(history_model.RiwayatPindai).filter(history_model.RiwayatPindai.id_pengguna == current_user_id).all()
    return history

@router.delete("/{history_id}")
def delete_user_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    """
    Endpoint untuk menghapus satu entri riwayat pemindaian,
    termasuk file gambar fisiknya.
    """
    history_to_delete = db.query(history_model.RiwayatPindai).filter(
        history_model.RiwayatPindai.id_riwayat == history_id,
        history_model.RiwayatPindai.id_pengguna == current_user_id
    ).first()

    if not history_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Riwayat tidak ditemukan atau Anda tidak memiliki akses.")
    
    # --- 2. Logika untuk menghapus file gambar fisik ---
    file_path = history_to_delete.gambar_pindai
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"File {file_path} berhasil dihapus.")
        else:
            print(f"File {file_path} tidak ditemukan, melanjutkan penghapusan data DB.")
    except Exception as e:
        # Jika terjadi error saat menghapus file, kita hanya akan mencatatnya
        # dan tetap melanjutkan untuk menghapus data dari database.
        print(f"Error saat menghapus file {file_path}: {e}")
    # ----------------------------------------------------

    # Menghapus data dari database
    db.delete(history_to_delete)
    db.commit()
    
    return {"message": "Riwayat berhasil dihapus"}
