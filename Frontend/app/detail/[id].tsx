import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import CustomLoading from '../../components/CustomLoading';
import { useAuth } from '../../services/AuthContext';
import apiClient from '../../services/api';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const { kumbungAktif } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!kumbungAktif) return;
        
        const response = await apiClient.get(`/history/deteksi/${kumbungAktif}`);
        const historyList = response.data;
        
        const item = historyList.find((x: any) => x.id_yolo === id);
        
        if (item) {
          // Format date
          const dateObj = new Date(item.created_at);
          const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('id-ID', { month: 'short' })} ${dateObj.getFullYear()}, ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')} WIB`;
          
          let status = 'Aman';
          if (item.infected_area_percent > 30) status = 'Bahaya';
          else if (item.infected_area_percent > 10) status = 'Waspada';

          // Format image URL
          let imageUrl = '';
          if (item.image_path) {
            const baseURL = apiClient.defaults.baseURL?.replace('/api', '') || 'http://192.168.0.114:8000';
            const cleanPath = item.image_path.replace(/\\/g, '/'); // Windows path fix
            imageUrl = `${baseURL}/${cleanPath}`;
          }

          setData({
            id_yolo: item.id_yolo,
            waktu_upload: formattedDate,
            image_path: imageUrl,
            confidence_score: item.confidence_score ? (item.confidence_score * 100).toFixed(1) : 0,
            hasil_deteksi: item.infected_area_percent > 0 ? `Terdeteksi Black Mold (${item.infected_area_percent.toFixed(1)}% area)` : 'Bersih dari kontaminasi',
            status: status,
            solusi: status === 'Bahaya' ? [
              'Segera pisahkan atau buang baglog yang terinfeksi agar spora tidak menyebar.',
              'Turunkan kelembaban ruangan kumbung hingga di bawah 80%.',
              'Pastikan sirkulasi udara (ventilasi/kipas) berjalan dengan maksimal.',
              'Semprot area sekitar dengan fungisida organik jika penyebaran mulai meluas.'
            ] : status === 'Waspada' ? [
              'Pantau ketat baglog yang dicurigai terinfeksi.',
              'Perbaiki sirkulasi udara dan pastikan suhu tidak terlalu panas.',
            ] : [
              'Kondisi jamur dan baglog sangat sehat.',
              'Pertahankan sirkulasi dan suhu ruangan.',
            ]
          });
        }
      } catch (error) {
        console.error("Gagal mengambil detail riwayat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [id, kumbungAktif]);

  const handleDelete = () => {
    Alert.alert(
      "Hapus Riwayat",
      "Apakah Anda yakin ingin menghapus data deteksi ini?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/history/deteksi/${id}`);
              router.back();
            } catch (error) {
              console.error("Gagal menghapus data:", error);
              Alert.alert("Error", "Gagal menghapus riwayat deteksi.");
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomLoading message="Memuat Detail Diagnosis..." />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Background Decor */}
      <View style={styles.bgDecorTop} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hasil Deteksi</Text>
        
        {/* Delete Button */}
        <TouchableOpacity 
          onPress={handleDelete} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Gambar Hasil Pindai */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.imageContainer}>
          <Image source={{ uri: data.image_path }} style={styles.image} resizeMode="cover" />
          <View style={[styles.statusBadge, data.status === 'Bahaya' ? styles.badgeDanger : styles.badgeSafe]}>
            <Text style={styles.statusBadgeText}>{data.status}</Text>
          </View>
        </Animated.View>

        {/* Informasi Utama */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics" size={20} color="#64748B" />
            <Text style={styles.sectionTitle}>Informasi Deteksi</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#94A3B8" style={{ width: 24 }} />
            <Text style={styles.infoText}>{data.waktu_upload}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="scan-outline" size={20} color="#94A3B8" style={{ width: 24 }} />
            <Text style={styles.infoText}>Confidence Score: <Text style={styles.highlightText}>{data.confidence_score}%</Text></Text>
          </View>

          <View style={[styles.resultBox, data.status === 'Bahaya' ? styles.resultBoxDanger : styles.resultBoxSafe]}>
            <Text style={[styles.resultLabel, data.status === 'Bahaya' ? {color: '#991B1B'} : {color: '#166534'}]}>Hasil Analisis AI:</Text>
            <Text style={[styles.resultValue, data.status === 'Bahaya' ? {color: '#991B1B'} : {color: '#166534'}]}>{data.hasil_deteksi}</Text>
          </View>
        </Animated.View>

        {/* Rekomendasi Solusi */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={20} color="#059669" />
            <Text style={styles.sectionTitle}>Rekomendasi Penanganan</Text>
          </View>
          
          {data.solusi.map((item: string, index: number) => (
            <View key={index} style={styles.solutionRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.solutionText}>{item}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F7FB' 
  },
  bgDecorTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    opacity: 0.5,
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F4F7FB' 
  },
  loadingText: { 
    fontFamily: 'Poppins-Medium', 
    marginTop: 16, 
    color: '#64748B' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 16, 
  },
  backButton: { 
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: { 
    fontFamily: 'Poppins-Bold', 
    fontSize: 18, 
    color: '#1E293B' 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  imageContainer: { 
    width: '100%', 
    height: 220, 
    borderRadius: 24, 
    overflow: 'hidden', 
    marginBottom: 20, 
    backgroundColor: '#FFFFFF', 
    elevation: 4, 
    shadowColor: '#94A3B8', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 12 
  },
  image: { 
    width: '100%', 
    height: '100%' 
  },
  statusBadge: { 
    position: 'absolute', 
    top: 16, 
    right: 16, 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  badgeDanger: { 
    backgroundColor: '#EF4444' 
  },
  badgeSafe: { 
    backgroundColor: '#10B981' 
  },
  statusBadgeText: { 
    fontFamily: 'Poppins-Bold', 
    color: '#FFFFFF', 
    fontSize: 12 
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 16, 
    elevation: 2, 
    shadowColor: '#94A3B8', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12 
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { 
    fontFamily: 'Poppins-SemiBold', 
    fontSize: 16, 
    color: '#1E293B', 
    marginLeft: 8 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  infoText: { 
    fontFamily: 'Poppins-Medium', 
    fontSize: 13, 
    color: '#475569', 
  },
  highlightText: { 
    fontFamily: 'Poppins-Bold', 
    color: '#1E293B' 
  },
  resultBox: { 
    marginTop: 12, 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
  },
  resultBoxDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resultBoxSafe: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  resultLabel: { 
    fontFamily: 'Poppins-Medium', 
    fontSize: 12, 
    marginBottom: 4 
  },
  resultValue: { 
    fontFamily: 'Poppins-Bold', 
    fontSize: 16, 
  },
  solutionRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12 
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginTop: 8,
    marginRight: 12,
  },
  solutionText: { 
    flex: 1, 
    fontFamily: 'Poppins-Regular', 
    fontSize: 13, 
    color: '#475569', 
    lineHeight: 22 
  },
});