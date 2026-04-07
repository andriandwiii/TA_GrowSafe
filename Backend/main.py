# ===================================================================
# File: main.py
# Lokasi: GuavaScan/Backend/main.py
# Deskripsi: File utama yang menjadi titik masuk aplikasi.
#            Tugasnya menginisialisasi FastAPI dan menyatukan semua endpoint.
# ===================================================================

from fastapi import FastAPI
from api import predict, auth, history

# Mengimpor komponen database dan model
from database import engine
from models import user, history as history_model # Memberi alias untuk history model

# ===================================================================
# Bagian ini memerintahkan SQLAlchemy untuk membuat semua tabel
# yang telah didefinisikan di dalam folder 'models' (user.py, history.py)
# ke dalam database MySQL Anda. Ini hanya akan berjalan jika tabel-tabel
# tersebut belum ada.
# ===================================================================
user.Base.metadata.create_all(bind=engine)
history_model.Base.metadata.create_all(bind=engine)


# Membuat instance utama dari aplikasi FastAPI
app = FastAPI(
    title="GuavaScan API",
    description="API untuk mendeteksi penyakit pada jambu biji dengan struktur modular."
)

# ===================================================================
# Menyertakan semua router dari folder 'api' ke dalam aplikasi utama.
# Ini membuat kode Anda tetap rapi dan terorganisir.
# ===================================================================
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(history.router, prefix="/history", tags=["History"])


@app.get("/", tags=["Root"])
async def read_root():
    """
    Endpoint root untuk mengecek apakah server berjalan dengan baik.
    Anda bisa mengaksesnya di http://127.0.0.1:8000
    """
    return {"message": "Selamat datang di GuavaScan API!"}

