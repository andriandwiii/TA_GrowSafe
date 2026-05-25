// ===================================================================
// File: AuthContext.js
// Lokasi: Frontend/services/AuthContext.js
// Deskripsi: Mengelola status autentikasi pengguna di seluruh aplikasi.
//            Menyimpan token JWT, data user, dan data kumbung aktif.
// ===================================================================

import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token:         null,
    user:          null,   // data user (id_pengguna, nama, email, dll)
    authenticated: false,
    isLoading:     true,
  });

  // Kumbung yang sedang aktif dipilih pengguna
  const [kumbungAktif, setKumbungAktif] = useState(null);

  // ── Load token saat aplikasi pertama kali dibuka ────────────────
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token    = await SecureStore.getItemAsync('token');
        const userJson = await SecureStore.getItemAsync('user');
        const kId      = await SecureStore.getItemAsync('activeKumbungId');

        if (token && userJson) {
          const user = JSON.parse(userJson);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setAuthState({ token, user, authenticated: true, isLoading: false });
          if (kId) setKumbungAktif(kId);
        } else {
          setAuthState({ token: null, user: null, authenticated: false, isLoading: false });
        }
      } catch (e) {
        console.error('Gagal memuat token:', e);
        setAuthState({ token: null, user: null, authenticated: false, isLoading: false });
      }
    };
    loadToken();
  }, []);

  // ── Register ────────────────────────────────────────────────────
  const register = async (nama, username, email, password) => {
    try {
      await apiClient.post('/auth/register', { nama, username, email, password });
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.detail || 'Gagal mendaftar',
      };
    }
  };

  // ── Login ───────────────────────────────────────────────────────
  const login = async (usernameOrEmail, password) => {
    try {
      const params = new URLSearchParams();
      params.append('username', usernameOrEmail);
      params.append('password', password);

      const response = await apiClient.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, user } = response.data;

      // Simpan token & user ke penyimpanan aman
      await SecureStore.setItemAsync('token', access_token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      setAuthState({ token: access_token, user, authenticated: true, isLoading: false });
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.detail || 'Username/email atau password salah',
      };
    }
  };

  // ── Logout ──────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      delete apiClient.defaults.headers.common['Authorization'];
      setAuthState({ token: null, user: null, authenticated: false, isLoading: false });
      setKumbungAktif(null);
    } catch (e) {
      console.error('Gagal saat logout:', e);
    }
  };

  // ── Update profile ──────────────────────────────────────────────
  const updateProfile = async (data) => {
    try {
      const response = await apiClient.put('/auth/me', data);
      const updatedUser = response.data;
      await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.detail || 'Gagal update profil',
      };
    }
  };

  const value = {
    ...authState,
    kumbungAktif,
    setKumbungAktif,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook agar mudah dipakai di komponen
export const useAuth = () => useContext(AuthContext);

export { AuthContext };
export default AuthContext;