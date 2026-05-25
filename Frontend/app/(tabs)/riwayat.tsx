// ===================================================================
// File: riwayat.tsx
// Lokasi: Frontend/app/(tabs)/riwayat.tsx
// Deskripsi: Halaman daftar riwayat deteksi dengan desain list modern.
// ===================================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import CustomLoading from '../../components/CustomLoading';

// Tipe data disesuaikan dengan struktur backend YOLO kamu
export type HistoryItem = {
  id_yolo: number;
  waktu_upload: string;
  image_path: string;
  confidence_score: number;
  hasil_deteksi: string;
  status: 'Aman' | 'Peringatan' | 'Bahaya'; 
};

const RiwayatScreen = () => {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fungsi fetch data (menggunakan dummy sementara karena API belum tersambung)
  const fetchHistory = async () => {
    try {
      // Nanti ganti dengan: const response = await apiClient.get('/history/');
      // setHistory(response.data);
      
      // Data dummy disesuaikan dengan konteks jamur
      setTimeout(() => {
        setHistory([
          {
            id_yolo: 1,
            waktu_upload: '13 Mei 2026, 14:22',
            image_path: 'https://images.unsplash.com/photo-1596443217462-81781292070e?auto=format&fit=crop&q=80&w=150', // Placeholder gambar jamur
            confidence_score: 94.5,
            hasil_deteksi: 'Black Mold (Mucor spp.)',
            status: 'Bahaya',
          },
          {
            id_yolo: 2,
            waktu_upload: '12 Mei 2026, 09:15',
            image_path: 'https://images.unsplash.com/photo-1555546098-963b65cb465a?auto=format&fit=crop&q=80&w=150',
            confidence_score: 98.2,
            hasil_deteksi: 'Normal (Sehat)',
            status: 'Aman',
          },
          {
            id_yolo: 3,
            waktu_upload: '10 Mei 2026, 16:40',
            image_path: 'https://images.unsplash.com/photo-1596443217462-81781292070e?auto=format&fit=crop&q=80&w=150',
            confidence_score: 85.0,
            hasil_deteksi: 'Green Mold (Trichoderma)',
            status: 'Peringatan',
          }
        ]);
        setIsLoading(false);
        setIsRefreshing(false);
      }, 1000);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchHistory();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHistory();
  }, []);

  // Fungsi untuk menentukan warna badge berdasarkan status
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Bahaya': return { bg: '#FFEbee', text: '#E53935', border: 'rgba(229,57,53,0.3)' };
      case 'Peringatan': return { bg: '#FFF3E0', text: '#F57C00', border: 'rgba(245,124,0,0.3)' };
      case 'Aman': return { bg: '#E8F5E9', text: '#2E7D32', border: 'rgba(46,125,50,0.3)' };
      default: return { bg: '#F5F5F5', text: '#757575', border: 'rgba(117,117,117,0.3)' };
    }
  };

  const renderItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    const badgeStyle = getBadgeColor(item.status);

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.8}
          onPress={() => router.push(`/detail/${item.id_yolo}` as any)}
        >
          <Image source={{ uri: item.image_path }} style={styles.thumbnail} />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>{item.waktu_upload}</Text>
              <View style={[styles.badge, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
                <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{item.status}</Text>
              </View>
            </View>
            
            <Text style={styles.resultText} numberOfLines={1}>
              {item.hasil_deteksi}
            </Text>
            
            <View style={styles.confidenceContainer}>
              <Ionicons name="scan-outline" size={14} color="#64748B" />
              <Text style={styles.confidenceText}>
                Akurasi: {item.confidence_score}%
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />
      
      {/* Background Decor */}
      <View style={styles.bgDecorTop} />

      <Animated.View entering={FadeIn.delay(100)} style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Riwayat Deteksi</Text>
        <Text style={styles.headerSubtitle}>Hasil analisis pengawasan tersimpan di sini</Text>
      </Animated.View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <CustomLoading fullScreen={false} message="Memuat riwayat..." />
        </View>
      ) : history.length === 0 ? (
        <Animated.View entering={FadeIn.delay(200)} style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>Belum ada riwayat pemindaian.</Text>
        </Animated.View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_yolo.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={onRefresh} 
              colors={[Colors.light.primary ?? '#2E7D32']}
              tintColor={Colors.light.primary ?? '#2E7D32'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  bgDecorTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    opacity: 0.5,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  listContainer: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#94A3B8',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
  },
  resultText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 16,
  },
});

export default RiwayatScreen;