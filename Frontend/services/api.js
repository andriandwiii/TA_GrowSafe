// ===================================================================
// File: api.js
// Lokasi: Frontend/services/api.js
// ===================================================================

import Constants from 'expo-constants';
import axios from 'axios';

// ==========================================
// PENGATURAN KONEKSI BACKEND
// ==========================================
// PENTING UNTUK APK: Wajib true agar tidak error saat ganti WiFi
const USE_NGROK = true;
const NGROK_URL = 'https://possum-albatross-veggie.ngrok-free.dev';

let API_BASE_URL = 'http://10.111.10.218:8000'; // Fallback aman

if (USE_NGROK) {
  API_BASE_URL = NGROK_URL;
  console.log(`[GrowSafe API] Terhubung via Ngrok: ${API_BASE_URL}`);
} else if (__DEV__) {
  // Mendapatkan IP laptop yang menjalankan server Metro Expo secara otomatis
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost || Constants?.manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const laptopIp = hostUri.split(':')[0]; // Ambil IP saja tanpa port metro
    API_BASE_URL = `http://${laptopIp}:8000`;
    console.log(`[GrowSafe API] Terhubung via Lokal (WiFi): ${API_BASE_URL}`);
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // timeout 30 detik (agar YOLO tidak error time-out)
});

export default apiClient;