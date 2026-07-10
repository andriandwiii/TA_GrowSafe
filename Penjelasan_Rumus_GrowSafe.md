# Penjelasan Rumus Prediksi Risiko & Estimasi Panen GrowSafe

Dokumen ini menjelaskan secara rinci dan mudah dipahami mengenai logika perhitungan yang ditanamkan ke dalam kecerdasan buatan (AI) sistem GrowSafe.

---

## 1. Rumus Prediksi Risiko Kontaminasi *Black Mold*

Sistem GrowSafe menghitung persentase "Risiko Kontaminasi" layaknya seorang juri yang memberikan **"Poin Pelanggaran"**. Semakin banyak kondisi buruk yang terjadi di dalam kumbung, semakin tinggi persentase risiko (maksimal 100%).

Sistem terbaru menggunakan model **Machine Learning (Polynomial Regression)** yang menganalisis 5 faktor utama secara bersamaan (holistik), bukan sekadar penjumlahan linear. Kelima faktor tersebut adalah:

### A. Poin Suhu (Iklim Mikro)
Suhu adalah faktor krusial bagi pertumbuhan jamur tiram.
*   **Zona Aman:** Jika suhu kumbung pas di angka **22°C sampai 28°C**, poinnya adalah **0**.
*   **Zona Bahaya:** Jika suhu naik di atas 28°C (kepanasan), model AI akan mendeteksi peningkatan risiko. Udara yang terlalu panas melemahkan miselium jamur dan memicu tumbuhnya jamur liar pembawa penyakit.

### B. Poin Kelembaban
*   **Zona Aman:** Jika kelembaban pas di angka **80% sampai 90%**, poinnya adalah **0**.
*   **Zona Bahaya:** Jika kelembaban **di bawah 80%** (terlalu kering), baglog akan kehilangan cairan dan miselium menjadi stres (rentan penyakit). Sebaliknya, jika kelembaban **di atas 90%** (terlalu basah/pengap), risiko juga melonjak tajam karena genangan air adalah tempat favorit spora *Black Mold* untuk berkembang biak secara masif.

### C. Poin Stres / Durasi LED Menyala
Ini ibarat *Timer* kerusakan. Setiap 1 menit LED merah (aktuator) menyala, sistem mencatat bahwa kumbung sedang dalam kondisi suhu/kelembaban yang buruk di luar batas wajar.
*   **Logikanya:** Jika kepanasan hanya 5 menit lalu normal kembali, jamur masih kuat bertahan. Namun jika stres dibiarkan berjam-jam, poin ini akan memperparah kalkulasi risiko.

### D. Poin Visual Kamera / YOLO (Bobot Bukti Fisik)
Ini adalah bukti fisik terkuat dari sistem GrowSafe. 
*   Hasil foto kamera mendeteksi persentase area baglog yang menghitam (*Black Mold*). Semakin luas area yang menghitam secara visual, semakin besar risikonya. Sistem menggunakan *Pixel Mask Union* agar perhitungan luas ini akurat.

### E. Fase Pertumbuhan Jamur (Fitur AI Terbaru)
Model AI kini cerdas membedakan fase usia baglog:
*   **Inkubasi (Masa rentan awal):** Spora jamur tiram masih lemah. Jika terjadi kondisi buruk, risikonya lebih fatal dibanding saat jamur sudah dewasa.
*   **Primordia (Muncul bakal jamur):** Sensitif terhadap perubahan mendadak.
*   **Produksi (Panen):** Miselium sudah kuat menutupi baglog, daya tahan alami lebih tinggi.

**Sinergi Polinomial (Efek Berlipat Ganda):**
Karena menggunakan AI berjenis *Polynomial*, sistem memahami efek "Kombinasi". 
*Contoh: Jika suhu sedikit panas, risikonya mungkin naik 5%. Jika kelembaban sedikit tinggi, naik 5%. TAPI, jika kumbung PANAS **sekaligus** PENGAP, model AI polinomial akan mendeteksinya sebagai kondisi ledakan spora yang sangat kritis, dan poin risikonya bisa melonjak drastis menjadi 60% (bukan sekadar 5+5=10%). Kombinasi inilah yang membuat AI GrowSafe sangat akurat menyerupai logika biologis asli.*

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
