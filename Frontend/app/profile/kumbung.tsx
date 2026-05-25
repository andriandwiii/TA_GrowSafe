import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import CustomLoading from '../../components/CustomLoading';
import apiClient from '../../services/api';
import { useAuth } from '../../services/AuthContext';

export default function KumbungListScreen() {
  const router = useRouter();
  
  const [kumbungList, setKumbungList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { kumbungAktif, setKumbungAktif } = useAuth();

  const fetchKumbungs = async () => {
    try {
      const response = await apiClient.get('/kumbung/');
      setKumbungList(response.data);
      
      const storedActiveId = await SecureStore.getItemAsync('activeKumbungId');
      if (storedActiveId) {
        // Jangan pakai parseInt jika id_kumbung adalah string (misal KMB001)
        // Kita simpan sebagai string untuk amannya
        setKumbungAktif(storedActiveId);
      } else if (response.data.length > 0) {
        const firstId = response.data[0].id_kumbung;
        setKumbungAktif(firstId);
        await SecureStore.setItemAsync('activeKumbungId', firstId.toString());
      }
    } catch (error) {
      console.error('Gagal mengambil daftar kumbung:', error);
      Toast.show({
        type: 'error',
        text1: 'Gagal Memuat Data',
        text2: 'Periksa koneksi internet Anda.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchKumbungs();
    }, [])
  );

  const handleSetActive = async (id: any) => {
    setKumbungAktif(String(id));
    await SecureStore.setItemAsync('activeKumbungId', String(id));
    Toast.show({
      type: 'success',
      text1: 'Berhasil',
      text2: 'Kumbung aktif telah diubah.',
    });
  };

  const handleAddKumbung = () => {
    router.push('/profile/kumbungForm' as any);
  };

  const handleEditKumbung = (id: number) => {
    router.push({ pathname: '/profile/kumbungForm', params: { id } } as any);
  };

  const handleDeleteKumbung = (id: number, nama: string) => {
    Alert.alert(
      'Hapus Kumbung',
      `Apakah Anda yakin ingin menghapus "${nama}"? Semua data terkait kumbung ini akan hilang permanen.`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await apiClient.delete(`/kumbung/${id}`);
              Toast.show({
                type: 'success',
                text1: 'Terhapus',
                text2: 'Kumbung telah dihapus secara permanen.',
              });
              fetchKumbungs();
            } catch (error) {
              console.error('Gagal menghapus kumbung:', error);
              Toast.show({
                type: 'error',
                text1: 'Gagal Menghapus',
                text2: 'Terjadi kesalahan saat menghapus kumbung.',
              });
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />
      <View style={styles.bgDecorTop} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Kumbung</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.illustration}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={48} color="#2E7D32" />
          </View>
          <Text style={styles.subtitle}>Pilih kumbung yang ingin dipantau atau tambahkan kumbung baru.</Text>
        </Animated.View>

        {isLoading ? (
          <CustomLoading message="Memuat daftar kumbung..." fullScreen={false} />
        ) : (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.listContainer}>
            {kumbungList.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 20 }}>Anda belum memiliki kumbung.</Text>
            ) : (
              kumbungList.map((kumbung) => {
                const isActive = String(kumbungAktif) === String(kumbung.id_kumbung);
                
                return (
                  <TouchableOpacity 
                    key={kumbung.id_kumbung} 
                    style={[styles.kumbungCard, isActive && styles.kumbungCardActive]}
                    onPress={() => handleSetActive(kumbung.id_kumbung)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.kumbungIcon, isActive ? {backgroundColor: '#DCFCE7'} : {backgroundColor: '#F1F5F9'}]}>
                      <Ionicons name="home" size={24} color={isActive ? '#16A34A' : '#94A3B8'} />
                    </View>
                    <View>
                      <Text style={[styles.kumbungName, isActive && {color: '#16A34A'}]}>{kumbung.nama_kumbung}</Text>
                      <Text style={styles.kumbungStatus}>{isActive ? 'Sedang Dipantau' : 'Ketuk untuk pantau'}</Text>
                    </View>
                  </View>
                  
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={28} color="#16A34A" />
                  )}
                </View>

                <View style={styles.divider} />

                <View style={styles.kumbungDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#64748B" />
                    <Text style={styles.detailText}>{kumbung.lokasi}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="cube-outline" size={16} color="#64748B" />
                    <Text style={styles.detailText}>{kumbung.kapasitas_baglog} Baglog</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEditKumbung(kumbung.id_kumbung);
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#0284C7" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteKumbung(kumbung.id_kumbung, kumbung.nama_kumbung);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={styles.deleteButtonText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
              })
            )}
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.bottomContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddKumbung}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Tambah Kumbung Baru</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  bgDecorTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, backgroundColor: '#DCFCE7', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, opacity: 0.5 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#1E293B' },
  content: { padding: 24, paddingBottom: 120 },
  illustration: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#BBF7D0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  subtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 },
  listContainer: { gap: 16 },
  kumbungCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, borderWidth: 2, borderColor: 'transparent' },
  kumbungCardActive: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  kumbungIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  kumbungName: { fontFamily: 'Poppins-Bold', fontSize: 16, color: '#1E293B', marginBottom: 2 },
  kumbungStatus: { fontFamily: 'Poppins-Medium', fontSize: 12, color: '#64748B' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  kumbungDetails: { gap: 8, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#475569', marginLeft: 8 },
  cardActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#E0F2FE', borderRadius: 8 },
  editButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: '#0284C7', marginLeft: 4 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FEE2E2', borderRadius: 8 },
  deleteButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: '#EF4444', marginLeft: 4 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 30, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  addButton: { flexDirection: 'row', backgroundColor: '#16A34A', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  addButtonText: { fontFamily: 'Poppins-Bold', fontSize: 16, color: '#FFFFFF', marginLeft: 8 }
});
