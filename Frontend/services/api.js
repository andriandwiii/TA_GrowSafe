// ===================================================================
// File: api.js
// Lokasi: Frontend/services/api.js
// ===================================================================

import axios from 'axios';

// Ganti IP ini dengan IP laptop kamu (hasil ipconfig)
// Pastikan HP dan laptop terhubung ke WiFi yang sama
const API_BASE_URL = 'http://192.168.0.111:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // timeout 10 detik
});

export default apiClient;