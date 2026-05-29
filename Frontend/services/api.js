// ===================================================================
// File: api.js
// Lokasi: Frontend/services/api.js
// ===================================================================

import Constants from 'expo-constants';
import axios from 'axios';

// Fallback IP jika aplikasi di-*build* (APK) atau gagal mendeteksi IP otomatis
let API_BASE_URL = 'http://10.111.10.218:8000';

if (__DEV__) {
  // Mendapatkan IP laptop yang menjalankan server Metro Expo secara otomatis
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost || Constants?.manifest2?.extra?.expoGo?.debuggerHost;
  
  if (hostUri) {
    const laptopIp = hostUri.split(':')[0]; // Ambil IP saja tanpa port metro (misal 192.168.1.5)
    API_BASE_URL = `http://${laptopIp}:8000`; // Ganti dengan port backend Anda (8000)
    console.log(`[GrowSafe API] Backend otomatis terhubung ke: ${API_BASE_URL}`);
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