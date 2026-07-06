# Gunakan Python versi ringan
FROM python:3.11-slim

# Atur folder kerja di dalam Docker
WORKDIR /app

# Install dependency sistem OS (Sangat penting untuk YOLO/OpenCV dan MySQL)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements dan install library Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh file backend (termasuk best.pt, model .pkl, dan .env)
COPY . .

# Buka port 8000
EXPOSE 8000

# Perintah untuk menjalankan server FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]