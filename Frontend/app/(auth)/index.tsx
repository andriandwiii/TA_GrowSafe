// ===================================================================
// File: index.tsx
// Lokasi: Frontend/app/(auth)/index.tsx
// Deskripsi: Halaman awal (Welcome Screen) untuk GrowSafe.
// Perbaikan: Tambah try-catch fallback untuk SVG, StatusBar platform-aware.
// ===================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

// Import SVG dengan fallback aman menggunakan try/catch
let HandAndCamera: React.ComponentType<any> | null = null;
let EllipseElement: React.ComponentType<any> | null = null;
try {
  HandAndCamera = require('../../assets/images/HandAndCamera.svg').default;
  EllipseElement = require('../../assets/images/EllipseElement.svg').default;
} catch (_) {
  // SVG tidak ditemukan, fallback ke placeholder
}

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.light.primary}
        translucent={Platform.OS === 'android'}
      />

      <View style={styles.illustrationContainer}>
        {EllipseElement && (
          <EllipseElement
            width="100%"
            height="80%"
            style={styles.ellipse}
          />
        )}
        {HandAndCamera && (
          <HandAndCamera width="80%" height="80%" />
        )}
        {/* Fallback jika SVG tidak ada */}
        {!HandAndCamera && (
          <View style={styles.svgFallback} />
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          <Text style={styles.growText}>Grow</Text>
          <Text style={styles.safeText}>Safe</Text>
        </Text>

        <Text style={styles.subtitle}>
          Asisten cerdas Anda dalam memantau kondisi kumbung dan menjaga kesehatan jamur budidaya
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? Colors.light.backgroundSecondary : 'white' },
          ]}
          onPress={() => router.push('/(auth)/login' as any)}
          accessibilityRole="button"
          accessibilityLabel="Masuk ke akun"
        >
          <Text style={[styles.buttonText, styles.loginButtonText]}>Masuk</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.25)' },
            styles.registerButton,
          ]}
          onPress={() => router.push('/(auth)/register' as any)}
          accessibilityRole="button"
          accessibilityLabel="Daftar akun baru"
        >
          <Text style={[styles.buttonText, styles.registerButtonText]}>Daftar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  illustrationContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ellipse: {
    position: 'absolute',
    top: -100,
    left: -20,
  },
  svgFallback: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  contentContainer: {
    flex: 0.4,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  growText: {
    color: Colors.light.accent,
  },
  safeText: {
    color: 'white',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  registerButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  loginButtonText: {
    color: Colors.light.primary ?? '#2E7D32',
  },
  registerButtonText: {
    color: 'white',
  },
});

export default WelcomeScreen;