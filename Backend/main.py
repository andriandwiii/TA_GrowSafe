# ===================================================================
# File: main.py
# Lokasi: GrowSafe/Backend/main.py
# ===================================================================

import sys
import os

# Tambahkan root folder Backend ke sys.path
# agar semua import seperti 'services.xxx', 'models.xxx' bisa ditemukan
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine

# Import semua model agar tabel terbuat otomatis
from models import user, kumbung, sensor_data, deteksi_yolo, prediksi, notifikasi

# Import semua router
from api import auth, kumbung as kumbung_api, sensor, predict, history, notification

# Buat semua tabel ke database (hanya jika belum ada)
user.Base.metadata.create_all(bind=engine)
kumbung.Base.metadata.create_all(bind=engine)
sensor_data.Base.metadata.create_all(bind=engine)
deteksi_yolo.Base.metadata.create_all(bind=engine)
prediksi.Base.metadata.create_all(bind=engine)
notifikasi.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GrowSafe API",
    description="API untuk deteksi Black Mold dan prediksi panen jamur budidaya.",
    version="1.0.0"
)

# Middleware CORS
# Hanya izinkan origin yang terdaftar di .env (pisahkan dengan koma)
# Default fallback ke localhost jika tidak ada di .env
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081,http://localhost:3000").strip()
origins = [o.strip() for o in ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount folder uploads agar gambar bisa diakses dari Frontend
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Daftarkan semua router
app.include_router(auth.router,            prefix="/auth",         tags=["Authentication"])
app.include_router(kumbung_api.router,     prefix="/kumbung",      tags=["Kumbung"])
app.include_router(sensor.router,          prefix="/sensor",       tags=["Sensor IoT"])
app.include_router(predict.router,         prefix="/predict",      tags=["Prediction"])
app.include_router(history.router,         prefix="/history",      tags=["History"])
app.include_router(notification.router,    prefix="/notification", tags=["Notification"])

from services.ws_manager import manager
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws/sensor/{id_kumbung}")
async def websocket_endpoint(websocket: WebSocket, id_kumbung: str):
    await manager.connect(websocket, id_kumbung)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, id_kumbung)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Selamat datang di GrowSafe API! 🍄"}