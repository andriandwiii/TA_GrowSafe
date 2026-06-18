// ===================================================================
// File: _layout.tsx
// Lokasi: Frontend/app/_layout.tsx
// Deskripsi: Diperbarui untuk menambahkan layar kamera sebagai modal.
// ===================================================================

import React, { useContext, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthContext, AuthProvider } from '../services/AuthContext';
import { ActivityIndicator, View, StyleSheet, Text, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { MenuProvider } from 'react-native-popup-menu';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import CustomLoading from '../components/CustomLoading';

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#16A34A', backgroundColor: '#FFFFFF', borderRadius: 12 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontFamily: 'Poppins-Bold', fontSize: 15, color: '#1E293B' }}
      text2Style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: '#64748B' }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#EF4444', backgroundColor: '#FFFFFF', borderRadius: 12 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontFamily: 'Poppins-Bold', fontSize: 15, color: '#1E293B' }}
      text2Style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: '#64748B' }}
    />
  ),
};

const RootLayout = () => {
  const { authenticated, isLoading: isAuthLoading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    ...Ionicons.font,
  });

  useEffect(() => {
    // Navigasi bar transparan di Android sudah ditangani oleh edgeToEdgeEnabled di app.json
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!fontsLoaded && !fontError) return; // Tunggu font selesai dimuat
    if (!segments || !segments[0]) return; // Router belum siap

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (authenticated && inAuthGroup) {
      // Gunakan setTimeout kecil untuk memberi napas pada router state
      setTimeout(() => router.replace('/(tabs)'), 100);
    } else if (!authenticated && !inAuthGroup) {
      setTimeout(() => router.replace('/(auth)' as any), 100);
    }
  }, [authenticated, isAuthLoading, segments, fontsLoaded, fontError]);

  if (isAuthLoading || (!fontsLoaded && !fontError)) {
    return <CustomLoading fullScreen message="Menyiapkan aplikasi..." />;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Menambahkan layar kamera sebagai modal penuh */}
      <Stack.Screen 
        name="pindaiKamera" 
        options={{ 
          headerShown: false, 
          presentation: 'fullScreenModal' 
        }} 
      />
    </Stack>
  );
};

export default function AppLayout() {
  return (
    <AuthProvider>
      <MenuProvider>
        <RootLayout />
        <Toast config={toastConfig} position="top" topOffset={60} />
      </MenuProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
