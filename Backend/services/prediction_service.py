# ===================================================================
# File: prediction_service.py
# Lokasi: GuavaScan/Backend/services/prediction_service.py
# Deskripsi: File ini berisi semua logika inti yang berkaitan dengan
#            model AI, termasuk memuat model dan menjalankan prediksi.
# ===================================================================

from PIL import Image
from ultralytics import YOLO
import torch

# --- Memuat Model ---
# Model dimuat sekali saat aplikasi pertama kali dimulai untuk efisiensi.
# Ini mencegah model dimuat ulang setiap kali ada permintaan prediksi.
try:
    # Pastikan file 'best.pt' berada di folder root 'Backend'
    model = YOLO("best.pt") 
    print("Model 'best.pt' berhasil dimuat oleh service.")
except Exception as e:
    print(f"Error saat memuat model 'best.pt': {e}")
    # Jika model gagal dimuat, kita set ke None agar bisa ditangani di level API.
    model = None

def get_model():
    """Fungsi helper untuk memastikan model tersedia sebelum digunakan."""
    if not model:
        raise RuntimeError("Model AI tidak berhasil dimuat atau tidak tersedia.")
    return model

def run_prediction(image: Image.Image) -> list:
    """
    Fungsi untuk menjalankan prediksi pada objek gambar yang diberikan.
    
    Args:
        image (Image.Image): Objek gambar dari library PIL untuk diprediksi.

    Returns:
        list: Sebuah daftar (list) yang berisi hasil deteksi. Setiap item
              dalam daftar adalah sebuah dictionary yang berisi detail
              satu deteksi (class_name, confidence, bounding_box).
    """
    yolo_model = get_model()
    
    # Melakukan inferensi dengan model YOLO
    results = yolo_model(image)

    # Memproses hasil deteksi
    detections = []
    # results[0] adalah hasil untuk gambar pertama (karena kita hanya memproses satu)
    for box in results[0].boxes:
        # Mengambil nama kelas dari ID kelas yang terdeteksi
        class_id = int(box.cls)
        class_name = yolo_model.names[class_id]
        
        # Mengambil skor keyakinan (confidence score)
        confidence = float(box.conf)
        
        # Mengambil koordinat bounding box [x1, y1, x2, y2]
        bounding_box = box.xyxy[0].tolist()

        detections.append({
            "class_name": class_name,
            "confidence": round(confidence, 4),
            "bounding_box": bounding_box
        })
    
    return detections
