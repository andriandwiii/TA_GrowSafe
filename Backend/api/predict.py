# ===================================================================
# File: predict.py
# Lokasi: GuavaScan/Backend/api/predict.py
# Deskripsi: Mengonversi dictionary rekomendasi menjadi string JSON
#            sebelum disimpan ke database.
# ===================================================================

import json
import io
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from PIL import Image
from services import prediction_service, auth_service, recommendation_service 
from schemas import history_schema
from models import history as history_model
from database import SessionLocal
from jose import jwt

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(auth_service.oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth_service.SECRET_KEY, algorithms=[auth_service.ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        return user_id
    except jwt.PyJWTError:
        raise credentials_exception

@router.post("/image", response_model=history_schema.HistoryResponse)
async def predict_image(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diunggah bukan gambar.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        detections = prediction_service.run_prediction(image)
        
        if not detections:
            raise HTTPException(status_code=404, detail="Tidak ada penyakit yang terdeteksi.")

        main_detection = detections[0]
        
        file_name = f"{uuid.uuid4()}.jpg"
        file_path = f"uploads/{file_name}"
        with open(file_path, "wb") as f:
            f.write(contents)

        # Panggil service untuk mendapatkan rekomendasi asli
        recommendation_dict = recommendation_service.get_recommendation(main_detection["class_name"])

        # Konversi dictionary ke string JSON sebelum disimpan
        recommendation_json = json.dumps(recommendation_dict)

        # Gunakan rekomendasi asli saat menyimpan ke database
        db_history = history_model.RiwayatPindai(
            id_pengguna=current_user_id,
            gambar_pindai=file_path,
            hasil_diagnosis=main_detection["class_name"],
            skor_keyakinan=main_detection["confidence"],
            rekomendasi_penanganan=recommendation_json # Menyimpan string JSON
        )
        db.add(db_history)
        db.commit()
        db.refresh(db_history)

        return db_history

    except Exception as e:
        print(f"Terjadi error saat prediksi: {e}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan internal: {e}")
