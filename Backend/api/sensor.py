# ===================================================================
# File: sensor.py
# Lokasi: GrowSafe/Backend/api/sensor.py
# ===================================================================

import os
import sys

# Fix path agar import dari root Backend selalu bisa ditemukan
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi                import APIRouter, Depends, HTTPException
from sqlalchemy.orm         import Session
from typing                 import List
from database               import SessionLocal
from models.sensor_data     import SensorData
from models.kumbung         import Kumbung
from schemas.sensor_schema  import SensorCreate, SensorResponse, SensorLatestResponse
from services.id_generator  import generate_id_sensor
from api.auth               import get_current_user, get_db
from models.user            import Pengguna

router = APIRouter()


# ── POST /sensor ───────────────────────────────────────────────────
@router.post("/", response_model=SensorResponse, status_code=201)
def kirim_data_sensor(
    data: SensorCreate,
    db: Session = Depends(get_db)
):
    """Terima data sensor dari perangkat IoT (ESP32). Tidak perlu token."""

    kumbung = db.query(Kumbung).filter(Kumbung.id_kumbung == data.id_kumbung).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    sensor = SensorData(
        id_sensor         = generate_id_sensor(db),
        id_kumbung        = data.id_kumbung,
        suhu              = data.suhu,
        kelembaban        = data.kelembaban,
        total_led_menyala = data.total_led_menyala
    )
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return sensor


# ── GET /sensor/{id_kumbung}/latest ───────────────────────────────
@router.get("/{id_kumbung}/latest", response_model=SensorLatestResponse)
def data_sensor_terbaru(
    id_kumbung: str,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil data sensor terbaru untuk dashboard."""

    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    latest = db.query(SensorData).filter(
        SensorData.id_kumbung == id_kumbung
    ).order_by(SensorData.created_at.desc()).first()

    if not latest:
        raise HTTPException(status_code=404, detail="Belum ada data sensor")

    return SensorLatestResponse(
        id_kumbung        = latest.id_kumbung,
        suhu              = latest.suhu,
        kelembaban        = latest.kelembaban,
        total_led_menyala = latest.total_led_menyala,
        waktu_baca        = latest.created_at
    )


# ── GET /sensor/{id_kumbung}/history ──────────────────────────────
@router.get("/{id_kumbung}/history", response_model=List[SensorResponse])
def riwayat_sensor(
    id_kumbung: str,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Pengguna = Depends(get_current_user)
):
    """Ambil riwayat data sensor (default 50 terbaru)."""

    kumbung = db.query(Kumbung).filter(
        Kumbung.id_kumbung  == id_kumbung,
        Kumbung.id_pengguna == current_user.id_pengguna
    ).first()
    if not kumbung:
        raise HTTPException(status_code=404, detail="Kumbung tidak ditemukan")

    return db.query(SensorData).filter(
        SensorData.id_kumbung == id_kumbung
    ).order_by(SensorData.created_at.desc()).limit(limit).all()