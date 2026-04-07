// ===================================================================
// File: _layout.tsx
// Lokasi: Frontend/app/(auth)/_layout.tsx
// Deskripsi: Diperbarui untuk menggunakan 'transparentModal' agar
//            formulir muncul sebagai sheet di atas halaman sebelumnya.
// ===================================================================

import React from 'react';
import { Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack>
      {/* Layar pertama di grup ini adalah halaman awal (index.tsx) */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />

      {/* Menggunakan 'transparentModal' untuk efek sheet */}
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          presentation: 'transparentModal', 
          animation: 'fade_from_bottom', // Animasi muncul dari bawah
        }} 
      />
      
      <Stack.Screen 
        name="register" 
        options={{ 
          headerShown: false,
          presentation: 'transparentModal',
          animation: 'fade_from_bottom', // Animasi muncul dari bawah
        }} 
      />
    </Stack>
  );
};

export default AuthLayout;
