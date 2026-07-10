# Rangkuman Komprehensif Sistem GrowSafe (Check-Point Tugas Akhir)

Dokumen ini adalah **ringkasan status (Master Context)** dari seluruh pengembangan sistem dan penulisan dokumen Tugas Akhir GrowSafe. Dokumen ini sengaja dibuat agar AI lain dapat membaca, memahami keseluruhan konteks teknis, dan langsung melanjutkan pengerjaan tanpa perlu mengulang pertanyaan dari awal.

---

## 1. Arsitektur Utama Sistem (Hibrida / Full-Stack)
GrowSafe adalah sistem *Early Warning System* (EWS) untuk memprediksi risiko penyakit *Black Mold* pada jamur tiram dan mengestimasi dampak panen. Sistem ini menggabungkan 4 pilar teknologi:
1. **Perangkat Keras (Node IoT):** Menggunakan mikrokontroler ESP32, sensor suhu & kelembaban (DHT22), dan aktuator indikator peringatan (LED Merah). 
2. **Computer Vision (YOLO):** Menggunakan **YOLOv11s** untuk mendeteksi *Black Mold* dari foto baglog melalui *Pixel Masking* (mencegah *overlap* area).
3. **Machine Learning Fusi (Regresi Polinomial):** Model Regresi Linier dengan `PolynomialFeatures(degree=2)` untuk meleburkan data lingkungan (Suhu, Kelembaban, Durasi LED), data visual (Luas Infeksi YOLO), dan fase pertumbuhan jamur menjadi persentase risiko (0-100%).
4. **Perangkat Lunak (FastAPI & React Native):** Backend menggunakan Python (FastAPI) untuk *handling* model `.pkl` dan `.pt`. Frontend berupa aplikasi *mobile* React Native untuk antarmuka pengguna (Petani).

---

## 2. Progres Penulisan Laporan (Tugas Akhir)
Seluruh bab laporan telah disesuaikan dengan arsitektur di atas:
*   **BAB I (Pendahuluan):** Latar belakang berfokus pada bahaya *Mucor spp.*, urgensi fusi data IoT dan AI, serta batasan masalah (YOLOv11s dan Regresi Polinomial 5 variabel).
*   **BAB II (Tinjauan Pustaka):** Telah dimutakhirkan dengan teori *Internet of Things* (ESP32), *FastAPI*, *Computer Vision* (YOLOv11s), *Polynomial Regression*, dan *Firebase Cloud Messaging* (FCM).
*   **BAB III (Perancangan Sistem):** ERD, Kamus Data, *Conceptual Data Model* (CDM), *Physical Data Model* (PDM), *Flowchart* IoT, *Wiring* Skematik Hardware, dan *Wireframe* UI sudah beres 100%.
*   **BAB IV (Implementasi):** Sedang berjalan. Telah selesai pada sub-bab:
    *   `4.1.1` Implementasi YOLOv11s (Augmentasi *Albumentations*, K-Fold, *Oversampling*).
    *   `4.1.2` Implementasi Regresi Polinomial (*Scaler*, Fitur Kuadratik, Evaluasi R2 = 0.9765).
    *   `4.1.3` Implementasi *Backend* FastAPI (Fusi *Endpoint* `/predict`, Skrip `prediction_service.py`, Rumus Panen & *Fallback*).
    *   *(Selanjutnya: 4.2 Implementasi Antarmuka Aplikasi)*.

---

## 3. Detail Arsitektur Basis Data (MySQL / SQLAlchemy)
Basis data memiliki 6 tabel yang saling berelasi (*Cascade*):
1. **users**: Otentikasi (`username`, `password`, `fcm_token`).
2. **kumbung**: Entitas ruangan budidaya (`kapasitas_baglog`, `waktu_mulai`). *Many-to-One* ke `users`.
3. **sensor_data**: Log IoT (`suhu`, `kelembaban`, `total_led_menyala`). *Many-to-One* ke `kumbung`.
4. **deteksi_yolo**: Log pindai kamera (`image_path`, `confidence_score`, `infected_area_percent`). *Many-to-One* ke `kumbung`.
5. **prediksi**: Luaran fusi AI (`risk_persen`, `predicted_panen_kg`, `kategori_risiko`). *Many-to-One* ke `kumbung`.
6. **notifikasi**: Log peringatan dini (`judul`, `isi`). Terhubung ke `users` dan `prediksi`.

---

## 4. Spesifikasi Teknis Node IoT (C++ / ESP32)
*   **Pin Hardware:** Sensor DHT22 terhubung ke **GPIO 4 (D4)**. Aktuator LED terhubung ke **GPIO 5 (D5)**.
*   **Interval Pengiriman:** Setiap 20 detik menggunakan HTTP POST ke *Backend* lokal dan *backup* ke ThingSpeak.
*   **Safety Features:** Dilengkapi *Watchdog Timer* (30 detik untuk *auto-restart* jika *hang*) dan sistem *Auto-Reconnect* Wi-Fi.
*   **Logika Peringatan (Stres Lingkungan):** Jika Suhu > 28°C **ATAU** Kelembapan < 80%, aktuator menyala. Total waktu menyala diakumulasikan dan dikirim sebagai variabel `total_led_menyala`.

---

## 5. Spesifikasi Teknis Pembuatan Model AI

### A. Model YOLOv11s (*Computer Vision*)
*   **Kelas Target (Binary):** `Healthy` (baglog sehat) dan `Black Mold` (bercak hitam/patogen). *Green mold* telah dihapus.
*   **Augmentasi (Albumentations):** Diubah ke ukuran (Resize) `800x800` px. Menerapkan *Sharpen*, *SafeRotate* (90°), *Flip*, dan *RandomBrightnessContrast*.
*   **Oversampling:** Foto berpenyakit digandakan 15x, foto sehat digandakan 3x.
*   **Metode Validasi:** **5-Fold Cross Validation**.
*   **Hyperparameter Training:** Epoch 100, Batch 4 (Limit VRAM GTX 1650 4GB), Optimizer AdamW, AMP=False.

### B. Model Regresi Polinomial (Fusi 5 Parameter)
*   **Fitur Input:** Suhu, Kelembaban, Durasi LED, Luas Infeksi YOLO, dan Fase Pertumbuhan (*Encoded*: Inkubasi=0, Primordia=1, Produksi=2).
*   **Pemrosesan:** `StandardScaler()` dan `PolynomialFeatures(degree=2)`.
*   **Metode Validasi:** 80% Train, 20% Test, diuji ulang dengan **5-Fold Cross Validation**.
*   **Hasil Metrik (Fold ke-2):** `R2_Score = 0.9765` | `MAE = 2.5790%` | `RMSE = 3.4270%`. (*Sangat akurat, gap Test-Train < 0.1 / no overfitting*).

---

## 6. Logika Matematis Spesifik (Backend)

**1. Logika Luas Infeksi Murni (YOLO Numpy Masking):**
Untuk menghitung persentase infeksi, *backend* tidak menjumlahkan *bounding box* secara mentah (yang bisa lebih dari 100% jika tumpang tindih). *Backend* menggunakan array `np.zeros` (hitam), lalu mewarnai kotak tebakan menjadi `1` (putih). Area murni adalah jumlah semua nilai `1`.

**2. Rumus Prediksi Estimasi Panen (Non-Linear):**
Panen tidak berkurang secara linear. Sistem menggunakan faktor pangkat 1.5 untuk mensimulasikan daya tahan biologis.
`Faktor = max(0.0, 1.0 - (Risk/100)^1.5)`
`Estimasi Panen = Kapasitas_Baglog * 0.4 kg * Faktor`

**3. Rumus Cadangan (Fallback Prediksi Risiko):**
Jika *server* gagal memuat *Machine Learning*, API akan memberikan nilai probabilitas risiko menggunakan hitungan statis *Piecewise Functions*:
*   Suhu < 22 (Penalti = selisih × 3.0), Suhu > 28 (Penalti = selisih × 5.5).
*   Kelembapan < 80 (Penalti = selisih × 0.8), Kelembapan > 90 (Penalti = selisih × 1.5).
*   Risk_Total = (Penalti_Suhu × 1.2) + (Penalti_Lembab × 1.5) + (LED × 0.08) + (YOLO × 0.9) (Maksimal 100%).

---
*(Dokumen ini di-generate secara otomatis berdasarkan riwayat percakapan dan struktur kode GrowSafe).*
