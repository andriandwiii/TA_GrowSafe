# ===================================================================
# File: recommendation_service.py
# Lokasi: GrowSafe/Backend/services/recommendation_service.py
# Deskripsi: Menghasilkan rekomendasi penanganan black mold
#            berdasarkan kategori risiko yang dihasilkan model Regresi.
# ===================================================================

# ── Data Rekomendasi Berdasarkan Kategori Risiko ───────────────────
REKOMENDASI = {
    "Rendah": (
        "✅ Kondisi kumbung dalam keadaan baik.\n"
        "• Pertahankan suhu antara 22°C - 28°C.\n"
        "• Jaga kelembaban di kisaran 80% - 90%.\n"
        "• Lakukan pemeriksaan visual baglog secara rutin setiap 2 hari sekali.\n"
        "• Pastikan sirkulasi udara di kumbung tetap lancar."
    ),
    "Sedang": (
        "⚠️ Risiko black mold mulai terdeteksi. Segera lakukan tindakan pencegahan!\n"
        "• Periksa dan kurangi kelembaban jika melebihi 90%.\n"
        "• Aktifkan kipas/ventilasi untuk menurunkan suhu jika di atas 28°C.\n"
        "• Periksa baglog satu per satu, pisahkan baglog yang menunjukkan bercak hitam.\n"
        "• Semprotkan larutan fungisida organik (misalnya trichoderma) pada area kumbung.\n"
        "• Tingkatkan frekuensi pemeriksaan menjadi setiap hari."
    ),
    "Tinggi": (
        "🚨 PERINGATAN! Risiko black mold sangat tinggi. Tindakan darurat diperlukan!\n"
        "• SEGERA isolasi dan keluarkan baglog yang terinfeksi dari kumbung.\n"
        "• Musnahkan baglog terinfeksi (bakar atau kubur) agar tidak menyebar.\n"
        "• Bersihkan dan sterilkan seluruh area kumbung.\n"
        "• Turunkan suhu kumbung secara paksa menggunakan pendingin/AC.\n"
        "• Kurangi kelembaban di bawah 85% untuk menghambat pertumbuhan Mucor spp.\n"
        "• Konsultasikan dengan ahli pertanian atau penyuluh setempat.\n"
        "• Tunda pengisian baglog baru hingga kondisi kumbung kembali stabil."
    )
}

def get_rekomendasi(kategori: str) -> str:
    """Ambil teks rekomendasi berdasarkan kategori risiko."""
    return REKOMENDASI.get(kategori, REKOMENDASI["Rendah"])


def tentukan_kategori(risk_persen: float) -> str:
    """
    Tentukan kategori risiko berdasarkan persentase risiko.
    - Rendah  : 0%  - 40%
    - Sedang  : 40% - 70%
    - Tinggi  : 70% - 100%
    """
    if risk_persen < 40:
        return "Rendah"
    elif risk_persen < 70:
        return "Sedang"
    else:
        return "Tinggi"