# ===================================================================
# File: recommendation_service.py
# Lokasi: GuavaScan/Backend/services/recommendation_service.py
# Deskripsi: Service ini bertugas untuk menyediakan teks rekomendasi
#            penanganan berdasarkan nama penyakit yang terdeteksi.
# ===================================================================

# Data rekomendasi disimpan dalam sebuah dictionary terstruktur.
RECOMMENDATION_DATA = {
    "Antraknosa": {
        "organik": "• Sanitasi Kebun (Paling Penting): Segera petik dan musnahkan (bakar atau kubur dalam tanah) semua buah, daun, dan ranting yang menunjukkan gejala.\n• Lakukan Pemangkasan: Pangkas cabang-cabang yang terlalu rimbun untuk meningkatkan sirkulasi udara.",
        "kimiawi": "• Lakukan penyemprotan fungisida sebelum gejala muncul, terutama menjelang musim hujan.\n• Bahan Aktif yang Efektif: Mankozeb, Propineb, Klorotalonil, atau Tembaga Hidroksida."
    },
    "Scab": {
        "organik": "• Pengelolaan Air: Hindari penyiraman dari atas yang membasahi daun. Siram langsung ke pangkal tanaman.\n• Jaga Jarak Tanam: Pastikan jarak tanam tidak terlalu rapat untuk sirkulasi udara yang baik.",
        "kimiawi": "• Fungisida Berbasis Tembaga: Lakukan penyemprotan dengan fungisida yang mengandung tembaga oksiklorida atau tembaga hidroksida saat tunas baru mulai tumbuh."
    },
    "Red Rust": {
        "organik": "• Pemupukan Berimbang: Pastikan tanaman mendapatkan nutrisi yang cukup (N, P, K). Tanaman yang sehat lebih tahan terhadap serangan alga.\n• Pengendalian Gulma: Bersihkan area di sekitar tanaman dari gulma.",
        "kimiawi": "• Semprot dengan Fungisida/Algaesida: Gunakan produk yang mengandung Tembaga Hidroksida atau Tembaga Sulfat. Lakukan penyemprotan pada pagi hari."
    },
    "Phytophthora": {
        "organik": "• Perbaikan Drainase Tanah: Ini adalah langkah paling krusial. Pastikan tidak ada air yang tergenang di sekitar pangkal batang.\n• Hindari Melukai Akar dan Batang: Luka bisa menjadi pintu masuk jamur.",
        "kimiawi": "• Aplikasi Fungisida Sistemik: Gunakan fungisida sistemik dengan bahan aktif seperti Fosetil Aluminium atau Metalaksil. Siramkan ke area perakaran."
    }
}

def get_recommendation(disease_name: str) -> dict:
    """
    Fungsi untuk mengambil dictionary rekomendasi berdasarkan nama penyakit.
    """
    default_recommendation = {
        "organik": "Tidak ada rekomendasi organik yang tersedia.",
        "kimiawi": "Tidak ada rekomendasi kimiawi yang tersedia."
    }
    return RECOMMENDATION_DATA.get(disease_name, default_recommendation)
