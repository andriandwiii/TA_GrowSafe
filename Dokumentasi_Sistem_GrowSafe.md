# 📖 Dokumentasi Lengkap Sistem GrowSafe

**GrowSafe** adalah sebuah sistem cerdas berbasis *Internet of Things* (IoT) dan *Artificial Intelligence* (AI) yang dirancang khusus untuk memonitor, menganalisis, dan memprediksi risiko penyakit *Black Mold* pada budidaya Jamur Tiram.

Dokumen ini menjelaskan secara detail bagaimana perangkat keras (sensor), perangkat lunak (backend & frontend), dan kecerdasan buatan saling terintegrasi menjadi satu kesatuan sistem.

---

## 1. Arsitektur Sistem Secara Keseluruhan (System Overview)

Sistem GrowSafe beroperasi pada 3 lapisan utama (*Three-Tier Architecture*):
1. **Persepsi & Kontrol (IoT / Hardware):** Perangkat ESP32 dan berbagai sensor yang diletakkan secara fisik di dalam kumbung jamur.
2. **Pemrosesan & Kecerdasan (Backend / AI Cloud):** Server berbasis Python (FastAPI) yang memproses data sensor, menjalankan deteksi gambar (YOLO), dan memprediksi risiko menggunakan *Machine Learning*.
3. **Antarmuka Pengguna (Frontend / Mobile App):** Aplikasi *mobile* berbasis React Native (Expo) yang digunakan oleh petani/peternak untuk memantau data secara *real-time* dan melihat estimasi panen.

---

## 2. Lapisan Perangkat Keras (Hardware & IoT)

Perangkat IoT bertugas sebagai "mata dan peraba" bagi sistem. Komponen utamanya meliputi:
*   **Mikrokontroler ESP32:** Otak utama di lapangan yang bertugas mengumpulkan data dan mengirimkannya ke server menggunakan koneksi Wi-Fi (Protokol HTTP/REST API).
*   **Sensor Suhu & Kelembaban (misal: DHT22):** Terus-menerus membaca kondisi iklim mikro di dalam kumbung. Suhu ideal (22-28°C) dan kelembaban ideal (80-90%) sangat krusial.
*   **LED Pin Merah (Indikator Peringatan):** Bertindak sebagai aktuator visual. Mikrokontroler diprogram untuk menyalakan LED ini HANYA JIKA suhu di dalam kumbung menjadi terlalu panas atau kelembaban terlalu rendah. Variabel durasi hidupnya LED ini (`total_led_menyala`) akan dicatat oleh server sebagai representasi "Berapa lama baglog jamur berada dalam kondisi stres/kritis".

---

## 3. Lapisan Server & Database (Backend Architecture)

Backend dibangun menggunakan **Python** dengan framework **FastAPI** demi kecepatan eksekusi tinggi, terutama saat mengolah gambar.
*   **Database (MySQL):** Menggunakan ORM *SQLAlchemy* untuk menyimpan riwayat suhu, data *user*, detail kumbung, dan hasil deteksi penyakit. Tabel dirancang agar memiliki relasi ketat (misal ID dengan 6 digit `USR000001` untuk mencegah duplikasi).
*   **Validasi Keamanan Data:** Semua API masuk dari sensor dilindungi. Terdapat validasi Pydantic yang akan menolak masuknya data tidak logis akibat kerusakan sensor (seperti suhu < 0°C atau kelembaban > 100%).
*   **Push Notification (Firebase):** Server terhubung secara aktif ke layanan FCM (*Firebase Cloud Messaging*). Jika server mendeteksi bahaya serius pada kumbung, server akan otomatis menembakkan notifikasi peringatan langsung ke layar HP pengguna.

---

## 4. Lapisan Kecerdasan Buatan (Artificial Intelligence)

Bagian paling inovatif dari GrowSafe adalah integrasi ganda antara Pengenalan Citra (Computer Vision) dan Regresi Prediktif.

### A. Deteksi Visual (Computer Vision dengan YOLO)
*   Petani dapat memfoto *baglog* yang mencurigakan melalui aplikasi. Foto ini dikirim ke server dan dianalisis menggunakan algoritma **YOLO** *(You Only Look Once)*.
*   YOLO akan mendeteksi area penyebaran spora hitam (*Black Mold*).
*   **Overlap Filtering (IoU - Pixel Masking):** Untuk memastikan persentase area infeksi akurat, sistem tidak asal menjumlahkan ukuran kotak (*bounding box*) deteksi. Sistem GrowSafe menghitung gabungan piksel aktual, sehingga kotak yang saling bertumpuk (*overlap*) tidak akan menyebabkan pembengkakan/penggandaan perhitungan area infeksi.

### B. Machine Learning (Polynomial Regression)
*   Sistem tidak mengandalkan satu parameter. Data dari **IoT** (suhu, kelembaban, durasi stres/LED) dan data dari **YOLO** (luas infeksi) digabung menjadi satu kesatuan (*Holistic Data*).
*   Data ini dimasukkan ke dalam model **Polynomial Regression (Degree 2)**. Pendekatan polinomial menangkap pola "Non-Linear". (Contoh: Kenaikan suhu sedikit mungkin tidak masalah, tapi jika suhu terus naik disertai turunnya kelembapan, risiko gagal panen bisa melonjak drastis, tidak sebatas linier/garis lurus).
*   Model akan mengeluarkan *output*: **Persentase Risiko Black Mold**. 
*   **Prediksi Panen Matematis:** Persentase risiko tersebut kemudian dimasukkan ke dalam rumus efisiensi untuk menghitung **estimasi kerugian (kg)** dari total panen normal baglog.

---

## 5. Lapisan Antarmuka Pengguna (Frontend / Mobile App)

Aplikasi dibangun menggunakan **React Native** (Expo Router). Memiliki desain *UI/UX* modern dengan fitur utama:
*   **Dashboard Pemantauan:** Menampilkan angka sensor dari ESP32 secara *real-time* dengan visualisasi kategori yang jelas (Aman, Waspada, Bahaya).
*   **Potensi Panen:** Menggabungkan analisis AI untuk menampilkan proyeksi total panen yang akan didapat pengguna dalam kilogram (kg) dan persentase efisiensi.
*   **Indikator Kepercayaan AI (Confidence Level):** Aplikasi dengan cerdas memberi tahu seberapa valid prediksi AI. Jika data sensor yang masuk dalam seminggu terakhir masih sedikit, aplikasi akan melabeli prediksi dengan tingkat kepercayaan "Rendah", begitu pula sebaliknya.
*   **Smart Cache:** Untuk mencegah beban server berlebih, halaman prediksi dilengkapi memori 5 menit agar tidak memanggil proses prediksi AI yang berat secara berulang-ulang tanpa alasan.

---

## 6. Kesimpulan Flow Sistem (Cara Kerja)

1. **Pemantauan (Detik/Menit):** ESP32 membaca kelembaban/suhu. Jika buruk, LED merah menyala. Data + durasi LED dikirim ke Cloud MySQL.
2. **Inspeksi (Harian):** Petani memfoto baglog. Foto dikirim ke Server. YOLO mengekstrak besaran area infeksi di gambar.
3. **Analisis (Permintaan User):** User membuka tab "Potensi Panen". Server mengambil semua riwayat 7 hari ke belakang.
4. **Prediksi (Real-time):** Model Machine Learning (Polynomial) menelan seluruh metrik lingkungan & visual, lalu mengeluarkan persentase bahaya & estimasi panen.
5. **Aksi (Mitigasi):** Jika risiko Tinggi, server memicu alarm darurat (*Firebase Push Notification*) langsung ke HP petani agar mereka segera membuang *baglog* yang rusak sebelum menyebar ke *baglog* lain.
