// ===================================================================
// File: pindaiKamera.tsx
// Lokasi: Frontend/app/pindaiKamera.tsx
// Deskripsi: Layar pemindaian kamera dengan UI profesional.
// ===================================================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Colors from '../constants/Colors';
import { useRouter, Stack } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Toast from 'react-native-toast-message';
import CustomLoading from '../components/CustomLoading';
import apiClient from '../services/api';
import { useAuth } from '../services/AuthContext';

const { width } = Dimensions.get('window');

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const isFocused = useIsFocused();
  const { kumbungAktif } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakePicture = async () => {
    if (cameraRef.current && !isScanning) {
      setIsScanning(true);
      try {
        if (!kumbungAktif) {
          Toast.show({ type: 'error', text1: 'Pilih Kumbung', text2: 'Tidak ada kumbung yang aktif saat ini.' });
          return;
        }

        const photo = await cameraRef.current.takePictureAsync();
        
        // Kompres dan ubah ukuran gambar agar pengiriman lebih cepat
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 640 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        const formData = new FormData();
        formData.append('id_kumbung', kumbungAktif);
        formData.append('file', {
          uri: manipResult.uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);

        const response = await apiClient.post('/predict/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: (data) => {
            return data;
          },
        });
        
        const newHistoryItem = response.data;
        router.replace(`/detail/${newHistoryItem.id_yolo}` as any);

      } catch (error: any) {
        const errMsg = error.response?.data?.detail || error.message || String(error);
        console.error('Gagal mengirim gambar:', errMsg);
        Toast.show({
          type: 'error',
          text1: 'Gagal Pemindaian',
          text2: `Error: ${errMsg}`,
        });
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handlePickImage = async () => {
    if (isScanning) return;
    
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Izin Ditolak',
        text2: 'Kami membutuhkan akses ke galeri foto Anda.',
      });
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (!kumbungAktif) {
          Toast.show({ type: 'error', text1: 'Pilih Kumbung', text2: 'Tidak ada kumbung yang aktif saat ini.' });
          return;
        }

        setIsScanning(true);
        const photo = result.assets[0];
        
        // Kompres dan ubah ukuran gambar agar pengiriman lebih cepat
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 640 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        const formData = new FormData();
        formData.append('id_kumbung', kumbungAktif);
        formData.append('file', {
          uri: manipResult.uri,
          type: 'image/jpeg',
          name: 'upload.jpg',
        } as any);
        
        const response = await apiClient.post('/predict/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: (data) => {
            return data;
          },
        });
        
        const newHistoryItem = response.data;
        router.replace(`/detail/${newHistoryItem.id_yolo}` as any);
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || error.message || String(error);
      console.error('Gagal mengirim gambar:', errMsg);
      Toast.show({
        type: 'error',
        text1: 'Gagal Mengunggah',
        text2: `Error: ${errMsg}`,
      });
    } finally {
      setIsScanning(false);
    }
  };

  if (!isFocused || hasPermission === null) {
    return <CustomLoading fullScreen message="Menginisialisasi kamera..." />;
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Izin Kamera' }} />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#CBD5E1" style={{ marginBottom: 16 }} />
          <Text style={styles.permissionText}>Akses Kamera Diperlukan</Text>
          <Text style={styles.permissionSubText}>Growsafe membutuhkan akses kamera Anda untuk memindai jamur. Silakan berikan izin melalui pengaturan perangkat.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back">
        <View style={styles.overlay}>
          {isScanning && <CustomLoading fullScreen message="Menganalisis gambar..." />}
          
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).springify()} style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Pindai Jamur</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="flash-outline" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>
          
          {/* Center Focus Area */}
          <View style={styles.content}>
            <Animated.Text entering={FadeIn.delay(200)} style={styles.instructionText}>
              Arahkan kamera ke jamur atau baglog
            </Animated.Text>
            
            <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.focusFrameContainer}>
              <View style={styles.focusFrame}>
                {/* Corner brackets */}
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </Animated.View>
          </View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footer}>
            {/* Tombol Gallery */}
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={handlePickImage}
              disabled={isScanning}
            >
              <Ionicons name="images-outline" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.captureButtonOuter} 
              onPress={handleTakePicture}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              <View style={styles.captureButtonInner}>
                <View style={styles.captureButtonCore} />
              </View>
            </TouchableOpacity>
            
            {/* Placeholder Spacer agar Capture button tetap di tengah */}
            <View style={styles.galleryButtonPlaceholder} />
          </Animated.View>

        </View>
      </CameraView>
    </View>
  );
};

const frameSize = width * 0.7;

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    textAlign: 'center',
    marginBottom: 40,
    overflow: 'hidden',
  },
  focusFrameContainer: {
    width: frameSize,
    height: frameSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingBottom: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonPlaceholder: {
    width: 50,
    height: 50,
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F4F7FB',
  },
  permissionText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 24,
  },
});

export default ScanScreen;
