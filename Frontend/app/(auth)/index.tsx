// ===================================================================
// File: index.tsx
// Lokasi: Frontend/app/(auth)/index.tsx
// Deskripsi: Halaman awal (Welcome Screen) dengan styling yang disesuaikan.
// ===================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable, // 1. Mengganti TouchableOpacity dengan Pressable
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

import HandAndCamera from '../../assets/images/HandAndCamera.svg';
import EllipseElement from '../../assets/images/EllipseElement.svg';

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.illustrationContainer}>
        <EllipseElement 
          width="100%" 
          height="80%" 
          style={{ 
            position: 'absolute', 
            top: -100, 
            left: -20, 
          }} 
        />
        <HandAndCamera width="80%" height="80%" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          <Text style={styles.guavaText}>Guava</Text>
          <Text style={styles.scanText}>Scan</Text>
        </Text>
        
        <Text style={styles.subtitle}>
          Asisten cerdas Anda dalam menjaga dan memantau kesehatan tanaman jambu biji
        </Text>

        {/* 2. Menggunakan komponen Pressable */}
        <Pressable
          // Style akan menjadi fungsi yang menerima status 'pressed'
          style={({ pressed }) => [
            styles.button,
            styles.loginButton,
            // Jika ditekan, ubah warna latar belakang
            { backgroundColor: pressed ? Colors.light.backgroundSecondary : 'white' }
          ]}
          onPress={() => router.push('/(auth)/login' as any)} 
        >
          <Text style={[styles.buttonText, styles.loginButtonText]}>Masuk</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.registerButton,
            // Jika ditekan, ubah warna latar menjadi sedikit lebih gelap
            { backgroundColor: pressed ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.5)' }
          ]}
          onPress={() => router.push('/(auth)/register' as any)} 
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
  contentContainer: {
    flex: 0.4,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'Poppins-Bold', 
    fontSize: 48,
    textAlign: 'center',
  },
  guavaText: {
    color: Colors.light.accent,
  },
  scanText: {
    color: 'white',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButton: {
    // backgroundColor sekarang diatur di dalam style prop Pressable
  },
  registerButton: {
    // backgroundColor sekarang diatur di dalam style prop Pressable
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  loginButtonText: {
    color: Colors.light.text,
  },
  registerButtonText: {
    color: 'white',
  },
});

export default WelcomeScreen;
