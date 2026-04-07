// ===================================================================
// File: pindaiKamera.tsx
// Lokasi: Frontend/app/pindaiKamera.tsx
// Deskripsi: Diperbarui dengan impor useIsFocused yang benar.
// ===================================================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useRouter, Stack } from 'expo-router';
import { useIsFocused } from '@react-navigation/native'; // <-- 1. Impor useIsFocused dari sini
import apiClient from '../services/api';

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const isFocused = useIsFocused(); // Hook untuk mendeteksi apakah layar sedang fokus

  useEffect(() => {
    // Meminta izin kamera saat komponen pertama kali dimuat
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakePicture = async () => {
    if (cameraRef.current && !isScanning) {
      setIsScanning(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, isImageMirror: false });
        
        const formData = new FormData();
        formData.append('file', {
          uri: photo.uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);

        Alert.alert('Menganalisis...', 'Gambar sedang diproses, mohon tunggu.');

        const response = await apiClient.post('/predict/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const newHistoryItem = response.data;
        // Menggunakan replace agar pengguna tidak bisa kembali ke halaman kamera setelah pindai berhasil
        router.replace(`/detail/${newHistoryItem.id_riwayat}` as any);

      } catch (error: any) {
        console.error('Gagal mengambil atau mengirim gambar:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.detail || 'Gagal melakukan pemindaian. Pastikan Anda terhubung ke internet.');
      } finally {
        setIsScanning(false);
      }
    }
  };

  // Tampilan loading atau jika layar tidak fokus
  if (!isFocused || hasPermission === null) {
    return <View style={styles.permissionContainer}><ActivityIndicator size="large" color={Colors.light.primary} /></View>;
  }

  // Tampilan jika izin kamera ditolak
  if (hasPermission === false) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Izin Kamera' }} />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Aplikasi memerlukan izin kamera untuk berfungsi.</Text>
          <Text style={styles.permissionSubText}>Silakan berikan izin melalui pengaturan ponsel Anda.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Tampilan utama dengan kamera
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} facing="back">
        <SafeAreaView style={styles.overlay}>
          {/* Bagian Atas: Tombol Tutup */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Bagian Tengah: Instruksi dan Bingkai Fokus */}
          <View style={styles.content}>
            <Text style={styles.instructionText}>Posisikan daun atau buah di tengah layar</Text>
            <View style={styles.focusFrame} />
          </View>

          {/* Bagian Bawah: Tombol Ambil Gambar */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={handleTakePicture}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator color={Colors.light.primary} />
              ) : (
                <Ionicons name="camera" size={40} color={Colors.light.primary} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24, // Memberi margin pada teks instruksi
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    textAlign: 'center', // Membuat teks align center
    marginBottom: 24,
  },
  focusFrame: {
    width: '100%',
    aspectRatio: 1, // Membuat bingkai menjadi persegi
    borderWidth: 2,
    borderColor: 'white',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  permissionText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    color: Colors.light.textSecondary,
  },
});

export default ScanScreen;
