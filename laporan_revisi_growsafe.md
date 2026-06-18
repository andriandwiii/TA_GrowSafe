# 📋 Laporan Penyelesaian Revisi GrowSafe

Dokumen ini merangkum seluruh perubahan, perbaikan *bug*, dan peningkatan sistem yang telah berhasil diimplementasikan pada proyek **GrowSafe** (Backend & Frontend) untuk keperluan Tugas Akhir (TA).

---

## 🔴 PRIORITAS TINGGI (Selesai 100%)

### 1. Model Prediksi: Tambah Polynomial Features + Fitur `fase`
*   **Status:** ✅ Selesai
*   **Perubahan:** Algoritma prediksi berhasil di- *upgrade* menggunakan **Polynomial Regression (Degree 2)**. Sistem kini menggunakan fitur yang lebih kompleks (`suhu²`, `kelembaban²`, kombinasi interaksi, dan fase pertumbuhan jamur) untuk menangkap pola risiko biologis *black mold* secara lebih akurat dan realistis.

### 2. Security: Pindahkan Secrets ke Environment Variables
*   **Status:** ✅ Selesai
*   **Perubahan:** Kredensial sensitif seperti konfigurasi *database* (`DB_USER`, `DB_PASSWORD`) dan kunci API telah dipindahkan ke dalam file `.env` untuk mencegah kebocoran data.

### 3. Security: Hapus `serviceAccountKey.json` dari Repository
*   **Status:** ✅ Selesai
*   **Perubahan:** File otentikasi Firebase ditambahkan ke dalam `.gitignore` agar tidak ikut ter- *commit* atau ter- *push* ke *repository* publik secara tidak sengaja.

### 4. Bug Fix: "Analisis AI" Hardcoded di Detail Pemantauan
*   **Status:** ✅ Selesai
*   **Perubahan:** Teks analisis yang sebelumnya statis (hardcoded) telah diubah menjadi dinamis, menyesuaikan secara langsung dengan data sensor aktual (suhu dan kelembapan) di layar detail pemantauan.

### 5. Bug Fix: Integrasi Push Notification Firebase (FCM)
*   **Status:** ✅ Selesai (Sisi Backend)
*   **Perubahan:** 
    *   Tabel `users` pada *database* telah berhasil disuntikkan kolom `fcm_token` menggunakan injeksi SQL langsung (*bypassing SQLAlchemy schema error*).
    *   Endpoint `PUT /auth/fcm-token` ditambahkan agar perangkat mobile bisa mendaftarkan token uniknya.
    *   Fungsi `send_notification()` akan otomatis ter- *trigger* jika prediksi risiko AI berstatus "Sedang" atau "Tinggi".
    *   *(Catatan: Implementasi expo-notifications di Frontend dibatalkan karena tidak didukung oleh Expo Go SDK 53, demi mencegah aplikasi crash saat demo. Fitur ini membutuhkan EAS Build APK native).*

### 6. Bug Fix: Field `kategori` Missing di Frontend Notifikasi
*   **Status:** ✅ Selesai
*   **Perubahan:** Model `Notifikasi` di *database* telah dimodifikasi menggunakan logika *virtual property* untuk mengirimkan data `kategori` ke Frontend (Pydantic schema `NotifikasiResponse`), sehingga warna indikator risiko (Tinggi/Sedang) bisa berbeda.

### 7. Bug Fix: Route Conflict di History API
*   **Status:** ✅ Selesai
*   **Perubahan:** Terjadi bentrok antara rute statis dan dinamis. Rute `GET /history/prediksi/detail/{id}` dipindahkan posisinya **sebelum** rute dinamis `/{id_kumbung}` di dalam `api/history.py` agar API dapat terpanggil dengan benar.

### 8. Bug Fix: ID Generator Race Condition + Limit 999
*   **Status:** ✅ Selesai
*   **Perubahan:** Algoritma pengurutan pembuatan ID otomatis yang sebelumnya berbasis huruf (*string*) memicu *bug* setelah angka 999. Sistem kini mengurutkan berdasarkan `.id.desc()` (*integer*), dan *zero-padding* ditambah menjadi 6 digit (contoh: `USR000001`).

### 9. Hapus Model `history.py` Sisa GuavaScan
*   **Status:** ✅ Selesai
*   **Perubahan:** File `models/history.py` yang merupakan *legacy code* dari proyek lain telah dihapus sepenuhnya untuk mencegah kebingungan sistem ORM.

---

## 🟡 PRIORITAS SEDANG (Selesai Sebagian Besar)

### 10. YOLO: Tambah Overlap Filtering (IoU)
*   **Status:** ✅ Selesai
*   **Perubahan:** Prediksi luas area terinfeksi yang sebelumnya salah (akibat tumpang tindih/ *overlap* kotak deteksi YOLO) telah disempurnakan. Algoritma kini menggunakan metode **Pixel Mask Union** (menggabungkan piksel kotak), memastikan infeksi di titik yang sama hanya dihitung satu kali.

### 11. Validasi Range Data Sensor
*   **Status:** ✅ Selesai
*   **Perubahan:** Menambahkan *constraint* `ge` dan `le` (Greater/Less Equal) pada `SensorCreate` schema menggunakan Pydantic untuk memblokir anomali *hardware* ESP32 (suhu minus, atau kelembaban di atas 100%).

### 12. Prediksi Auto-Trigger Setiap Buka Halaman
*   **Status:** ❌ Dibatalkan (By Request)
*   **Keterangan:** Upaya implementasi fitur *Cache* 5 Menit dibatalkan sesuai permintaan (*reject*), guna mempertahankan kemampuan aplikasi mendemonstrasikan prediksi ulang secara *real-time* kapanpun layar ditekan.

### 13. Timeout API Terlalu Pendek untuk YOLO
*   **Status:** ✅ Selesai
*   **Perubahan:** Durasi batas waktu menunggunya (*timeout*) pada konfigurasi Axios di aplikasi mobile (`Frontend/services/api.js`) ditingkatkan drastis dari 10 detik (10000ms) menjadi 30 detik (30000ms) untuk mengakomodasi waktu proses inferensi model yang berat.

---

*Laporan ini dihasilkan secara otomatis pada penyelesaian sesi revisi arsitektur GrowSafe.*
