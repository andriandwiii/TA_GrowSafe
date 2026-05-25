// ===================================================================
// File: riwayat.tsx
// Lokasi: Frontend/app/(tabs)/riwayat.tsx
// Deskripsi: Halaman daftar riwayat deteksi & prediksi dengan desain list modern.
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
import apiClient from '../../services/api';
import { useAuth } from '../../services/AuthContext';

export type HistoryItem = {
  id_yolo: string;
  waktu_upload: string;
  image_path: string;
  confidence_score: number;
  hasil_deteksi: string;
  status: 'Aman' | 'Peringatan' | 'Bahaya'; 
};

export type PrediksiHistoryItem = {
  id_prediksi: string;
  waktu: string;
  risiko_persen: number;
  panen_kg: number;
  kategori: string;
  status: 'Aman' | 'Peringatan' | 'Bahaya'; 
};

const RiwayatScreen = () => {
  const router = useRouter();
  const { kumbungAktif } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'deteksi' | 'prediksi'>('deteksi');
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [prediksiHistory, setPrediksiHistory] = useState<PrediksiHistoryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!kumbungAktif) return;
    try {
      // Fetch both endpoints concurrently
      const [deteksiRes, prediksiRes] = await Promise.all([
        apiClient.get(`/history/deteksi/${kumbungAktif}`),
        apiClient.get(`/history/prediksi/${kumbungAktif}`)
      ]);
      
      // Map Deteksi
      const mappedDeteksi = deteksiRes.data.map((item: any) => {
        const dateObj = new Date(item.created_at);
        const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('id-ID', { month: 'short' })} ${dateObj.getFullYear()}, ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')} WIB`;
        
        let status = 'Aman';
        if (item.infected_area_percent > 30) status = 'Bahaya';
        else if (item.infected_area_percent > 10) status = 'Peringatan';

        let imageUrl = '';
        if (item.image_path) {
          const baseURL = apiClient.defaults.baseURL?.replace('/api', '') || 'http://192.168.0.114:8000';
          const cleanPath = item.image_path.replace(/\\/g, '/');
          imageUrl = `${baseURL}/${cleanPath}`;
        }

        return {
          id_yolo: item.id_yolo,
          waktu_upload: formattedDate,
          image_path: imageUrl,
          confidence_score: item.confidence_score ? (item.confidence_score * 100).toFixed(1) : 0,
          hasil_deteksi: item.infected_area_percent > 0 ? `Terdeteksi Black Mold (${item.infected_area_percent.toFixed(1)}%)` : 'Normal (Sehat)',
          status: status,
        };
      });
      setHistory(mappedDeteksi);

      // Map Prediksi
      const mappedPrediksi = prediksiRes.data.map((item: any) => {
        const dateObj = new Date(item.created_at);
        const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('id-ID', { month: 'short' })} ${dateObj.getFullYear()}, ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')} WIB`;
        
        let status = 'Aman';
        if (item.kategori_risiko === 'Tinggi') status = 'Bahaya';
        else if (item.kategori_risiko === 'Sedang') status = 'Peringatan';

        return {
          id_prediksi: item.id_prediksi,
          waktu: formattedDate,
          risiko_persen: item.risk_persen || 0,
          panen_kg: item.predicted_panen_kg || 0,
          kategori: item.kategori_risiko,
          status: status,
        };
      });
      setPrediksiHistory(mappedPrediksi);

    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchHistory();
    }, [kumbungAktif])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHistory();
  }, [kumbungAktif]);

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Bahaya': return { bg: '#FFEbee', text: '#E53935', border: 'rgba(229,57,53,0.3)' };
      case 'Peringatan': return { bg: '#FFF3E0', text: '#F57C00', border: 'rgba(245,124,0,0.3)' };
      case 'Aman': return { bg: '#E8F5E9', text: '#2E7D32', border: 'rgba(46,125,50,0.3)' };
      default: return { bg: '#F5F5F5', text: '#757575', border: 'rgba(117,117,117,0.3)' };
    }
  };

  const renderDeteksiItem = ({ item, index }: { item: HistoryItem; index: number }) => {
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
            <Text style={styles.resultText} numberOfLines={1}>{item.hasil_deteksi}</Text>
            <View style={styles.confidenceContainer}>
              <Ionicons name="scan-outline" size={14} color="#64748B" />
              <Text style={styles.confidenceText}>Akurasi: {item.confidence_score}%</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPrediksiItem = ({ item, index }: { item: PrediksiHistoryItem; index: number }) => {
    const badgeStyle = getBadgeColor(item.status);
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <TouchableOpacity 
          style={[styles.card, { alignItems: 'center' }]}
          activeOpacity={0.8}
          onPress={() => router.push(`/detail-prediksi/${item.id_prediksi}` as any)}
        >
          <View style={[styles.iconBox, { backgroundColor: badgeStyle.bg }]}>
            <Ionicons name="analytics" size={28} color={badgeStyle.text} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>{item.waktu}</Text>
              <View style={[styles.badge, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
                <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{item.kategori}</Text>
              </View>
            </View>
            <Text style={styles.resultText} numberOfLines={1}>Estimasi Panen: {item.panen_kg} kg</Text>
            <View style={styles.confidenceContainer}>
              <Ionicons name="warning-outline" size={14} color="#64748B" />
              <Text style={styles.confidenceText}>Risiko Kontaminasi: {item.risiko_persen}%</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      
      <View style={styles.bgDecorTop} />

      <Animated.View entering={FadeIn.delay(100)} style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Riwayat</Text>
        <Text style={styles.headerSubtitle}>Hasil deteksi kamera & prediksi panen tersimpan</Text>
        
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'deteksi' && styles.tabButtonActive]}
            onPress={() => setActiveTab('deteksi')}
          >
            <Ionicons name="camera-outline" size={18} color={activeTab === 'deteksi' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'deteksi' && styles.tabTextActive]}>Deteksi YOLO</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'prediksi' && styles.tabButtonActive]}
            onPress={() => setActiveTab('prediksi')}
          >
            <Ionicons name="leaf-outline" size={18} color={activeTab === 'prediksi' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'prediksi' && styles.tabTextActive]}>Prediksi Panen</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <CustomLoading fullScreen={false} message="Memuat riwayat..." />
        </View>
      ) : activeTab === 'deteksi' ? (
        history.length === 0 ? (
          <Animated.View entering={FadeIn.delay(200)} style={styles.centerContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Belum ada riwayat deteksi.</Text>
          </Animated.View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderDeteksiItem}
            keyExtractor={(item) => item.id_yolo.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          />
        )
      ) : (
        prediksiHistory.length === 0 ? (
          <Animated.View entering={FadeIn.delay(200)} style={styles.centerContainer}>
            <Ionicons name="analytics-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Belum ada riwayat prediksi.</Text>
          </Animated.View>
        ) : (
          <FlatList
            data={prediksiHistory}
            renderItem={renderPrediksiItem}
            keyExtractor={(item) => item.id_prediksi.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          />
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  bgDecorTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, backgroundColor: '#E8F5E9', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, opacity: 0.5 },
  headerContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontFamily: 'Poppins-Bold', fontSize: 24, color: '#1E293B', letterSpacing: -0.5 },
  headerSubtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#64748B', marginTop: 4 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, marginTop: 16, elevation: 2, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#2E7D32' },
  tabText: { fontFamily: 'Poppins-Medium', fontSize: 13, color: '#64748B', marginLeft: 6 },
  tabTextActive: { color: '#FFFFFF' },

  listContainer: { padding: 24, paddingTop: 8, paddingBottom: 120 },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 16, padding: 16, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  thumbnail: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#F1F5F9' },
  iconBox: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateText: { fontFamily: 'Poppins-Medium', fontSize: 12, color: '#94A3B8' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontFamily: 'Poppins-SemiBold', fontSize: 10 },
  resultText: { fontFamily: 'Poppins-SemiBold', fontSize: 15, color: '#1E293B', marginBottom: 8 },
  confidenceContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  confidenceText: { fontFamily: 'Poppins-Medium', fontSize: 12, color: '#64748B', marginLeft: 6 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontFamily: 'Poppins-Medium', fontSize: 16, color: '#94A3B8', marginTop: 16 },
});

export default RiwayatScreen;