// ===================================================================
// File: Colors.ts
// Lokasi: Frontend/constants/Colors.ts
// Deskripsi: Menyimpan palet warna aplikasi GuavaScan.
// ===================================================================

const tintColorLight = '#2E7D32'; // Menggunakan hijau sebagai warna utama
const tintColorDark = '#fff';

export default {
  light: {
    text: '#1B1B1B', // Warna teks utama
    background: '#F5F5F5', // Warna latar belakang
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    // Warna kustom Anda
    primary: '#2E7D32', // Hijau alami
    accent: '#E5989B', // Guava Pink
    textSecondary: '#616161',
    backgroundSecondary: '#E0E0E0',
    warning: '#FFA000',
    error: '#D32F2F',
  },
  dark: {
    // Anda bisa mendefinisikan palet warna untuk mode gelap di sini
    text: '#fff',
    background: '#1B1B1B',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    // Warna kustom Anda untuk mode gelap
    primary: '#2E7D32',
    accent: '#E5989B',
    textSecondary: '#E0E0E0',
    backgroundSecondary: '#616161',
    warning: '#FFA000',
    error: '#D32F2F',
  },
};
