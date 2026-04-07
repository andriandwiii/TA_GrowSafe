// ===================================================================
// File: api.js
// Lokasi: Frontend/services/api.js
// Deskripsi: Mengelola konfigurasi koneksi terpusat ke backend API
//            menggunakan Axios.
// ===================================================================

import axios from 'axios';

// --- PENTING: Konfigurasi Alamat IP Backend ---
// Ganti string 'ALAMAT_IP_KOMPUTER_ANDA' dengan alamat IP lokal
// komputer Anda yang sedang menjalankan server backend.
//
// Mengapa tidak 'localhost' atau '127.0.0.1'?
// Karena aplikasi mobile (baik di emulator atau di ponsel fisik)
// berjalan sebagai perangkat terpisah. 'localhost' bagi aplikasi
// akan merujuk ke ponsel itu sendiri, bukan ke komputer Anda.
//
// Cara menemukan alamat IP Anda:
// 1. Pastikan komputer dan ponsel Anda terhubung ke jaringan Wi-Fi yang sama.
// 2. Di Windows: Buka Command Prompt, ketik 'ipconfig', cari alamat 'IPv4 Address'.
// 3. Di Mac/Linux: Buka Terminal, ketik 'ifconfig' atau 'ip a', cari alamat IP Anda.
//
// Contoh: const API_BASE_URL = 'http://192.168.1.5:8000';
// ===================================================================
const API_BASE_URL = 'http://10.19.103.116:8000';

// Membuat instance Axios yang sudah dikonfigurasi sebelumnya.
// Semua permintaan yang menggunakan 'apiClient' akan secara otomatis
// menggunakan baseURL dan header yang sudah ditetapkan di sini.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mengekspor instance apiClient agar bisa digunakan di file lain,
// seperti di AuthContext.js.
export default apiClient;
