// ===================================================================
// File: riwayat.tsx
// Lokasi: Frontend/app/(tabs)/riwayat.tsx
// Deskripsi: Halaman untuk menampilkan daftar riwayat pemindaian pengguna.
// ===================================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl, // Untuk fitur pull-to-refresh
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import apiClient from '../../services/api';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import HistoryCard from '../../components/HistoryCard'; // Mengimpor komponen kartu

// Mendefinisikan tipe data untuk satu item riwayat agar kode lebih aman
export type HistoryItem = {
  id_riwayat: number;
  hasil_diagnosis: string;
  skor_keyakinan: number;
  tanggal_pindai: string;
  gambar_pindai: string;
};

// Komponen utama untuk layar Riwayat
const HistoryScreen = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Fungsi untuk mengambil data riwayat dari API
  const fetchHistory = async () => {
    try {
      const response = await apiClient.get('/history/');
      setHistory(response.data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Gagal memuat riwayat. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // useFocusEffect akan menjalankan fetchHistory setiap kali layar ini dibuka/kembali fokus
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchHistory();
    }, [])
  );

  // Fungsi untuk menangani pull-to-refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHistory();
  }, []);

  // Tampilan saat data sedang dimuat
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  // Tampilan jika terjadi error saat memuat data
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {history.length === 0 ? (
        // Tampilan jika tidak ada riwayat sama sekali
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={64} color={Colors.light.textSecondary} />
          <Text style={styles.emptyText}>Anda belum memiliki riwayat pemindaian.</Text>
          <Text style={styles.emptySubText}>Ayo mulai pindai penyakit tanaman Anda!</Text>
        </View>
      ) : (
        // Tampilan daftar riwayat jika ada data
        <FlatList
          data={history}
          renderItem={({ item }) => <HistoryCard item={item} />}
          keyExtractor={(item) => item.id_riwayat.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.light.text,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  }
});

export default HistoryScreen;
