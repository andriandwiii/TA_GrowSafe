// ===================================================================
// File: AuthContext.js
// Lokasi: Frontend/services/AuthContext.js
// Deskripsi: Menggunakan React Context untuk mengelola status autentikasi
//            pengguna di seluruh aplikasi secara terpusat.
// ===================================================================

import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from './api'; // Mengimpor instance Axios yang sudah dikonfigurasi

// Membuat Context. Ini akan menjadi "wadah" untuk state dan fungsi autentikasi.
const AuthContext = createContext();

// Membuat komponen Provider. Komponen ini akan "membungkus" seluruh aplikasi
// dan menyediakan akses ke state autentikasi.
const AuthProvider = ({ children }) => {
  // State untuk menyimpan informasi autentikasi
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: false,
    isLoading: true, // isLoading berguna untuk menampilkan layar loading saat pertama kali cek token
  });

  // useEffect ini akan berjalan sekali saat aplikasi pertama kali dimuat
  useEffect(() => {
    // Fungsi untuk memeriksa apakah ada token yang tersimpan di ponsel
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        
        if (token) {
          // Jika token ditemukan, anggap pengguna sudah login
          setAuthState({
            token: token,
            authenticated: true,
            isLoading: false,
          });
          // Mengatur token ini sebagai header default untuk semua permintaan API selanjutnya
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          // Jika tidak ada token, pengguna belum login
          setAuthState({ token: null, authenticated: false, isLoading: false });
        }
      } catch (e) {
        // Handle error jika gagal membaca token
        console.error("Gagal memuat token:", e);
        setAuthState({ token: null, authenticated: false, isLoading: false });
      }
    };
    loadToken();
  }, []);

  // Fungsi untuk menangani proses pendaftaran
  const register = async (username, email, password) => {
    try {
      // Memanggil endpoint /auth/register di backend
      await apiClient.post('/auth/register', { username, email, password });
      return { success: true };
    } catch (e) {
      // Mengembalikan pesan error dari backend jika ada
      return { success: false, error: e.response?.data?.detail || 'Gagal mendaftar' };
    }
  };

  // Fungsi untuk menangani proses login
  const login = async (usernameOrEmail, password) => {
    try {
      // Backend mengharapkan data login dalam format 'x-www-form-urlencoded'
      const params = new URLSearchParams();
      params.append('username', usernameOrEmail);
      params.append('password', password);

      // Memanggil endpoint /auth/login
      const response = await apiClient.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const token = response.data.access_token;
      
      // Simpan token dengan aman di penyimpanan ponsel
      await SecureStore.setItemAsync('token', token);
      
      // Atur header default untuk permintaan selanjutnya
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Perbarui state untuk menandakan pengguna sudah login
      setAuthState({ token: token, authenticated: true, isLoading: false });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.detail || 'Gagal login' };
    }
  };

  // Fungsi untuk menangani proses logout
  const logout = async () => {
    try {
      // Hapus token dari penyimpanan aman
      await SecureStore.deleteItemAsync('token');
      
      // Hapus header otorisasi dari instance Axios
      delete apiClient.defaults.headers.common['Authorization'];
      
      // Perbarui state untuk menandakan pengguna sudah logout
      setAuthState({ token: null, authenticated: false, isLoading: false });
    } catch (e) {
      console.error("Gagal saat logout:", e);
    }
  };

  // Nilai yang akan disediakan oleh Provider ke seluruh aplikasi
  const value = {
    ...authState, // (token, authenticated, isLoading)
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Mengekspor Context dan Provider
export { AuthContext, AuthProvider };
