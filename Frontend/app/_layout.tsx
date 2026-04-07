// ===================================================================
// File: _layout.tsx
// Lokasi: Frontend/app/_layout.tsx
// Deskripsi: Diperbarui untuk menambahkan layar kamera sebagai modal.
// ===================================================================

import React, { useContext, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthContext, AuthProvider } from '../services/AuthContext';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { MenuProvider } from 'react-native-popup-menu';

const RootLayout = () => {
  const { authenticated, isLoading: isAuthLoading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded || isAuthLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (authenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!authenticated && !inAuthGroup) {
      router.replace('/(auth)' as any);
    }
  }, [authenticated, isAuthLoading, fontsLoaded, segments]);

  if (!fontsLoaded || isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (fontError) {
    return <Text>Error memuat font: {fontError.message}</Text>
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
    <MenuProvider>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
