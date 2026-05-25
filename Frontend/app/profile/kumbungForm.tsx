import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import CustomLoading from '../../components/CustomLoading';
import apiClient from '../../services/api';

export default function KumbungFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;
  
  const [namaKumbung, setNamaKumbung] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [kapasitas, setKapasitas] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('');

  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await apiClient.get(`/kumbung/${params.id}`);
        const data = response.data;
        setNamaKumbung(data.nama_kumbung);
        setLokasi(data.lokasi);
        setKapasitas(data.kapasitas_baglog.toString());
        setWaktuMulai(data.waktu_mulai_budidaya);
      } catch (error) {
        console.error('Gagal mengambil detail kumbung:', error);
        Toast.show({
          type: 'error',
          text1: 'Gagal Memuat Data',
          text2: 'Tidak dapat memuat detail kumbung.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditMode) {
      fetchDetail();
    }
  }, [params.id, isEditMode]);

  const handleSave = async () => {
    if (!namaKumbung || !lokasi || !kapasitas || !waktuMulai) {
      Toast.show({
        type: 'error',
        text1: 'Data Tidak Lengkap',
        text2: 'Pastikan semua kolom telah terisi.',
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      nama_kumbung: namaKumbung,
      lokasi: lokasi,
      kapasitas_baglog: parseInt(kapasitas, 10),
      waktu_mulai_budidaya: waktuMulai,
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/kumbung/${params.id}`, payload);
        Toast.show({
          type: 'success',
          text1: 'Tersimpan',
          text2: 'Pengaturan kumbung berhasil diperbarui.',
        });
        router.back();
      } else {
        await apiClient.post('/kumbung/', payload);
        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: 'Kumbung baru berhasil ditambahkan.',
        });
        router.back();
      }
    } catch (error: any) {
      console.error('Gagal menyimpan kumbung:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Gagal Menyimpan',
        text2: 'Terjadi kesalahan saat menyimpan data kumbung.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && <CustomLoading fullScreen message={isEditMode ? "Memproses..." : "Menyimpan data..."} />}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />
      <View style={styles.bgDecorTop} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Kumbung' : 'Tambah Kumbung'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.illustration}>
          <View style={styles.iconCircle}>
            <Ionicons name={isEditMode ? "create-outline" : "add-circle-outline"} size={48} color="#2E7D32" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Kumbung</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="home-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={namaKumbung} onChangeText={setNamaKumbung} placeholder="Contoh: Kumbung 3" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lokasi</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={lokasi} onChangeText={setLokasi} placeholder="Contoh: Atap Rumah" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kapasitas Baglog</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="cube-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={kapasitas} onChangeText={setKapasitas} keyboardType="numeric" placeholder="Contoh: 150" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Waktu Mulai Budidaya</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={waktuMulai} onChangeText={setWaktuMulai} placeholder="YYYY-MM-DD" />
            </View>
            <Text style={styles.helperText}>Format: Tahun-Bulan-Tanggal (Contoh: 2026-05-20)</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isEditMode ? 'Simpan Perubahan' : 'Simpan Kumbung Baru'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  bgDecorTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, backgroundColor: '#DCFCE7', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, opacity: 0.5 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#1E293B' },
  content: { padding: 24, paddingBottom: 100 },
  illustration: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#BBF7D0', justifyContent: 'center', alignItems: 'center' },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Poppins-Medium', fontSize: 13, color: '#475569', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 52 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: 14, color: '#1E293B', height: '100%' },
  helperText: { fontFamily: 'Poppins-Regular', fontSize: 11, color: '#94A3B8', marginTop: 6, marginLeft: 4 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 30, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  saveButton: { backgroundColor: '#16A34A', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveButtonText: { fontFamily: 'Poppins-Bold', fontSize: 16, color: '#FFFFFF' }
});
