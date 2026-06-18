# Penjelasan Rumus Prediksi Risiko & Estimasi Panen GrowSafe

Dokumen ini menjelaskan secara rinci dan mudah dipahami mengenai logika perhitungan yang ditanamkan ke dalam kecerdasan buatan (AI) sistem GrowSafe.

---

## 1. Rumus Prediksi Risiko Kontaminasi *Black Mold*

Sistem GrowSafe menghitung persentase "Risiko Kontaminasi" layaknya seorang juri yang memberikan **"Poin Pelanggaran"**. Semakin banyak kondisi buruk yang terjadi di dalam kumbung, semakin banyak poin pelanggaran yang terkumpul. Total poin pelanggaran inilah yang menjadi Persentase Risiko (maksimal 100%).

Total Risiko dihitung berdasarkan 4 faktor utama:
**Total Risiko = (Poin Suhu) + (Poin Kelembaban) + (Poin Stres / Durasi LED) + (Poin Visual Kamera YOLO)**

Berikut adalah rincian cara sistem memberikan poin pada masing-masing faktor:

### A. Poin Suhu (Iklim Mikro)
Suhu adalah faktor krusial bagi pertumbuhan jamur tiram.
*   **Zona Aman:** Jika suhu kumbung pas di angka **22°C sampai 28°C**, poinnya adalah **0**.
*   **Zona Bahaya:** Jika suhu naik di atas 28°C (kepanasan), sistem akan mulai menghitung selisihnya dan memberikan poin pelanggaran. Udara yang terlalu panas melemahkan miselium jamur dan memicu tumbuhnya jamur liar pembawa penyakit.

### B. Poin Kelembaban
*   **Zona Aman:** Jika kelembaban pas di angka **80% sampai 90%**, poinnya adalah **0**.
*   **Zona Bahaya:** Jika kelembaban di atas 90% (terlalu basah/pengap), sistem memberikan poin pelanggaran yang tinggi. Air yang menggenang atau udara yang terlalu basah adalah tempat favorit spora *Black Mold* untuk berkembang biak.

### C. Poin Stres / Durasi LED Menyala
Ini ibarat *Timer* kerusakan. Setiap 1 menit LED merah menyala (berarti kumbung sedang dalam kondisi suhu/kelembaban yang buruk), sistem akan menambahkan sedikit poin pelanggaran.
*   **Logikanya:** Jika kumbung hanya kepanasan selama 5 menit lalu dingin lagi, jamur masih kuat bertahan. Namun jika kepanasan dibiarkan selama berjam-jam, poin stres ini akan terus menumpuk dan menaikkan persentase risiko kontaminasi secara perlahan tapi pasti.

### D. Poin Visual Kamera / YOLO (Bobot Tertinggi)
Ini adalah bukti fisik terkuat dari sistem GrowSafe. 
*   Jika dari hasil foto kamera terdeteksi ada area baglog yang sudah menghitam (*Black Mold*), sistem akan langsung memberikan poin pelanggaran yang sangat besar (hampir 1 banding 1).
*   **Logikanya:** Jika kamera sudah bisa melihat warna hitam, berarti penyakitnya *sudah benar-benar ada secara fisik*, bukan lagi sekadar potensi dari udara.

**Contoh Kasus Kesimpulan AI:**
*"Suhu dan kelembaban kumbung sangat ideal (Poin = 0). Tapi waktu difoto, ternyata ada bercak hitam terdeteksi sedikit (Poin YOLO = 15). Maka sistem menyimpulkan risiko kumbung adalah 15% (Aman/Rendah). Namun, jika besoknya suhu berubah jadi sangat panas dan pengap, sistem akan menambahkan Poin Suhu dan Poin Kelembaban, sehingga risikonya melonjak menjadi 60% (Bahaya). Artinya, penyakit 15% tadi akan menyebar dengan sangat cepat akibat udara yang kini memburuk."*

---

## 2. Rumus Prediksi Estimasi Panen (Dampak Finansial)

Setelah AI mendapatkan angka **Total Risiko (Persentase)** di atas, sistem akan menghitung berapa banyak perkiraan panen yang terbuang atau gagal tumbuh. 

Sistem tidak menguranginya secara mentah-mentah, melainkan menggunakan rumus efek **Non-Linear** (pangkat 1.5). Dalam ilmu biologi, jamur tidak mati secara perlahan seperti garis lurus, melainkan memiliki daya tahan (*barrier*) sebelum akhirnya hancur eksponensial.

**Langkah Perhitungan:**
1.  **Menghitung Panen Ideal:**
    Diasumsikan 1 baglog jamur tiram normal menghasilkan 0.4 kg (400 gram) jamur.
    `Panen Ideal = Total Baglog × 0.4 kg`
2.  **Menghitung Efisiensi Daya Tahan:**
    `Efisiensi = 100% - (Persen Risiko ^ 1.5)`
    *(Risiko 10% hanya menurunkan efisiensi sedikit menjadi 96.8%. Namun risiko 50% akan menghancurkan efisiensi menjadi sisa 64.6%)*.
3.  **Hasil Akhir Estimasi Panen:**
    `Estimasi Panen (kg) = Panen Ideal × Efisiensi`

Melalui dua tahap perhitungan di atas, aplikasi GrowSafe mampu mensimulasikan dampak nyata dari lingkungan kumbung terhadap produktivitas finansial petani secara logis dan ilmiah.
