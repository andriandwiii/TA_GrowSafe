// ===================================================================
// File: index.tsx
// Lokasi: Frontend/app/(tabs)/index.tsx
// Deskripsi: Halaman Dashboard Utama untuk Monitoring Sensor IoT.
// ===================================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../../services/api';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeIn,
  withSpring,
  useSharedValue,
  useAnimatedStyle
} from 'react-native-reanimated';
import { useAuth } from '../../services/AuthContext';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const router = useRouter();
  const { user, setKumbungAktif } = useAuth();
  const insets = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Menangani klik titik tiga pada kartu sensor
  const handleSensorOptions = (tipeSensor: string) => {
    Alert.alert(
      `Opsi ${tipeSensor}`,
      `Pilih tindakan untuk sensor ${tipeSensor.toLowerCase()}:`,
      [
        { text: 'Lihat Grafik Riwayat', onPress: () => console.log('Lihat Grafik') },
        { text: 'Batal', style: 'cancel' }
      ]
    );
  };

  // State data sensor
  const [sensorData, setSensorData] = useState({
    suhu: 0,
    kelembaban: 0,
    led: 0,
    status: 'Memuat...',
    statusMessage: 'Mengambil data dari server...',
    theme: 'offline' // 'optimal', 'waspada', 'bahaya', 'kritis', 'dingin', 'offline'
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [activeKumbungId, setActiveKumbungId] = useState<string | null>(null);

  const getKumbungStatus = (s: number, k: number) => {
    if (s > 31) return { status: 'Kritis', message: 'Tindakan segera diperlukan! Suhu ekstrem dapat mengancam kelangsungan hidup jamur.', theme: 'kritis' };
    if (s >= 29 && s <= 31) {
      if (k > 90) return { status: 'Bahaya', message: 'Peringatan! Kombinasi panas dan lembab sangat berisiko memicu pertumbuhan black mold.', theme: 'bahaya' };
      return { status: 'Waspada', message: 'Suhu terlalu hangat. Segera tingkatkan sirkulasi udara untuk menurunkan suhu.', theme: 'waspada' };
    }
    if (s >= 22 && s <= 28) {
      if (k > 95) return { status: 'Bahaya', message: 'Kelembaban terlalu jenuh. Risiko kontaminasi dan pembusukan sangat tinggi.', theme: 'bahaya' };
      if (k >= 91 && k <= 95) return { status: 'Waspada', message: 'Udara terlalu lembab. Kurangi penyemprotan air dan perbaiki sirkulasi.', theme: 'waspada' };
      if (k >= 80 && k <= 90) return { status: 'Optimal', message: 'Sempurna! Suhu dan kelembaban berada pada tingkat paling ideal untuk panen maksimal.', theme: 'optimal' };
      return { status: 'Waspada', message: 'Lingkungan terlalu kering. Jamur berisiko mengering, segera tingkatkan kelembaban.', theme: 'waspada' }; // Asumsi < 80 tetap waspada
    }
    if (s < 22) {
      return { status: 'Terlalu Dingin', message: 'Suhu terlampau dingin. Fase pertumbuhan dan produksi jamur akan terhenti.', theme: 'dingin' };
    }
    return { status: 'Optimal', message: 'Sempurna! Suhu dan kelembaban berada pada tingkat paling ideal untuk panen maksimal', theme: 'optimal' };
  };

  const fetchSensorData = async (kumbungId: string) => {
    try {
      const response = await apiClient.get(`/sensor/${kumbungId}/latest`);
      const { suhu, kelembaban, total_led_menyala } = response.data;

      const st = getKumbungStatus(suhu || 0, kelembaban || 0);

      setSensorData({
        suhu: suhu || 0,
        kelembaban: kelembaban || 0,
        led: total_led_menyala || 0,
        status: st.status,
        statusMessage: st.message,
        theme: st.theme
      });
    } catch (error: any) {
      console.log('Gagal mengambil data sensor:', error.message);
      setSensorData({
        suhu: 0,
        kelembaban: 0,
        led: 0,
        status: 'Offline',
        statusMessage: 'Sensor belum mendeteksi data atau kumbung tidak tersedia.',
        theme: 'offline'
      });
    }
  };

  const loadInitialData = async () => {
    setIsRefreshing(true);
    try {
      let kId = await SecureStore.getItemAsync('activeKumbungId');
      if (!kId) {
        // Fetch daftar kumbung jika belum ada yg aktif
        const response = await apiClient.get('/kumbung/');
        if (response.data && response.data.length > 0) {
          kId = response.data[0].id_kumbung.toString();
          await SecureStore.setItemAsync('activeKumbungId', kId as string);
        }
      }

      if (kId) {
        setActiveKumbungId(kId);
        setKumbungAktif(kId); // Sinkronisasi ke Global Context agar detailPemantauan tidak loading
        await fetchSensorData(kId);
      } else {
        setSensorData(prev => ({
          ...prev,
          status: 'Tidak ada Kumbung',
          statusMessage: 'Silakan tambahkan kumbung terlebih dahulu.',
          theme: 'offline'
        }));
      }
    } catch (error) {
      console.error('Error memuat dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await apiClient.get('/notification/unread');
      setUnreadCount(response.data.length || 0);
    } catch (error) {
      console.log('Gagal ambil unread notif:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let intervalId: ReturnType<typeof setInterval>;
      let ws: WebSocket | null = null;

      const initializeAndConnect = async () => {
        await loadInitialData();
        await fetchUnreadNotifications();

        const kId = await SecureStore.getItemAsync('activeKumbungId');
        if (kId) {
          // 1. Koneksi WebSockets untuk data sensor real-time (tanpa polling)
          const baseUrl = apiClient.defaults.baseURL || 'http://localhost:8000';
          // Ubah protokol http/https menjadi ws/wss
          const wsUrl = baseUrl.replace(/^http/, 'ws').replace(/\/$/, '') + `/ws/sensor/${kId}`;
          
          ws = new WebSocket(wsUrl);
          
          ws.onopen = () => {
            console.log('🔗 WebSocket terhubung secara Real-Time!');
          };
          
          ws.onmessage = (e) => {
            try {
              const data = JSON.parse(e.data);
              console.log('⚡ Data Instan dari IoT:', data);
              // Update state UI secara instan (0 delay)
              const st = getKumbungStatus(data.suhu || 0, data.kelembaban || 0);
              setSensorData({
                suhu: data.suhu || 0,
                kelembaban: data.kelembaban || 0,
                led: data.total_led_menyala || 0,
                status: st.status,
                statusMessage: st.message,
                theme: st.theme
              });
            } catch (err) {
              console.log('Error parsing WS data', err);
            }
          };

          ws.onerror = (e: any) => {
            console.log('⚠️ WebSocket Error:', e.message);
          };

          // 2. Polling super lambat khusus notifikasi (30 detik sekali) - Hemat Baterai
          intervalId = setInterval(() => {
             fetchUnreadNotifications();
          }, 30000);
        }
      };

      initializeAndConnect();

      return () => {
        // Bersihkan saat user pindah layar (Cleanup)
        if (intervalId) clearInterval(intervalId);
        if (ws) {
          ws.close();
          console.log('🔌 WebSocket ditutup karena pindah layar.');
        }
      };
    }, [])
  );

  const onRefresh = useCallback(() => {
    loadInitialData();
  }, []);

  const getThemeStyles = () => {
    switch (sensorData.theme) {
      case 'optimal': return { card: styles.statusOptimal, iconBg: styles.iconBgOptimal, iconColor: '#2E7D32', textColor: styles.textOptimal, icon: 'checkmark-circle' };
      case 'waspada': return { card: styles.statusWaspada, iconBg: styles.iconBgWaspada, iconColor: '#E65100', textColor: styles.textWaspada, icon: 'warning' };
      case 'bahaya': return { card: styles.statusBahaya, iconBg: styles.iconBgBahaya, iconColor: '#C62828', textColor: styles.textBahaya, icon: 'alert' };
      case 'kritis': return { card: styles.statusKritis, iconBg: styles.iconBgKritis, iconColor: '#B71C1C', textColor: styles.textKritis, icon: 'alert-circle' };
      case 'dingin': return { card: styles.statusDingin, iconBg: styles.iconBgDingin, iconColor: '#1565C0', textColor: styles.textDingin, icon: 'snow' };
      case 'offline': default: return { card: styles.statusOffline, iconBg: styles.iconBgOffline, iconColor: '#94A3B8', textColor: styles.textOffline, icon: 'power' };
    }
  };

  const themeStyle = getThemeStyles();

  return (
    <View style={styles.mainContainer}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />

      {/* Background Decor */}
      <View style={styles.bgDecorTop} />

      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary ?? '#2E7D32']}
            tintColor={Colors.light.primary ?? '#2E7D32'}
          />
        }
      >
        {/* Header Sapaan */}
        <Animated.View entering={FadeIn.delay(100).duration(500)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Halo, Selamat datang</Text>
            <Text style={styles.userName}>{user?.nama || 'Pengguna'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationIcon}
            activeOpacity={0.7}
            onPress={() => router.push('/notifikasi' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
            {unreadCount > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </Animated.View>

        {/* Card Status Kumbung Utama */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={[styles.statusCard, themeStyle.card]}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIconBg, themeStyle.iconBg]}>
                <Ionicons
                  name={themeStyle.icon as any}
                  size={24}
                  color={themeStyle.iconColor}
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>Status Kumbung</Text>
                <Text style={[styles.statusText, themeStyle.textColor]}>
                  {sensorData.status}
                </Text>
              </View>
            </View>
            <Text style={styles.statusSubtext}>
              {sensorData.statusMessage}
            </Text>
          </View>
        </Animated.View>

        {/* Grid Sensor IoT */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pemantauan Real-Time</Text>
            <TouchableOpacity onPress={() => router.push('/detailPemantauan' as any)}>
              <Text style={styles.seeAllText}>Detail</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sensorGrid}>
            {/* Card Suhu */}
            <View style={styles.sensorCard}>
              <View style={styles.sensorCardInner}>
                <View style={[styles.iconContainer, { backgroundColor: '#FFF0F0' }]}>
                  <Ionicons name="thermometer" size={26} color="#E53935" />
                </View>
                <TouchableOpacity
                  style={styles.moreIcon}
                  onPress={() => handleSensorOptions('Suhu Ruangan')}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.sensorValue}>
                {sensorData.suhu}
                <Text style={styles.sensorUnit}> °C</Text>
              </Text>
              <Text style={styles.sensorLabel}>Suhu Ruangan</Text>
            </View>

            {/* Card Kelembaban */}
            <View style={styles.sensorCard}>
              <View style={styles.sensorCardInner}>
                <View style={[styles.iconContainer, { backgroundColor: '#F0F7FF' }]}>
                  <Ionicons name="water" size={26} color="#1E88E5" />
                </View>
                <TouchableOpacity
                  style={styles.moreIcon}
                  onPress={() => handleSensorOptions('Kelembaban')}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.sensorValue}>
                {sensorData.kelembaban}
                <Text style={styles.sensorUnit}> %</Text>
              </Text>
              <Text style={styles.sensorLabel}>Kelembaban</Text>
            </View>
          </View>
        </Animated.View>

        {/* Area Informasi Tambahan */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Tips Hari Ini</Text>
              <Text style={styles.infoText}>Jaga sirkulasi udara tetap baik untuk mencegah kontaminasi jamur.</Text>
            </View>
            <Ionicons name="bulb-outline" size={40} color="#F59E0B" style={styles.infoIcon} />
          </View>
        </Animated.View>

        {/* Tombol Prediksi Panen */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <TouchableOpacity
            style={styles.predictButton}
            activeOpacity={0.8}
            onPress={() => router.push('/prediksiPanen' as any)}
          >
            <Ionicons name="analytics" size={22} color="white" style={styles.predictIcon} />
            <Text style={styles.predictButtonText}>Lihat Prediksi Panen</Text>
            <Ionicons name="chevron-forward" size={20} color="white" style={styles.predictArrow} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  bgDecorTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    opacity: 0.5,
  },
  container: {
    padding: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  userName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    backgroundColor: '#EF4444',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  statusOptimal: { borderColor: 'rgba(76, 175, 80, 0.2)' },
  statusWaspada: { borderColor: 'rgba(255, 152, 0, 0.2)' },
  statusBahaya: { borderColor: 'rgba(229, 57, 53, 0.2)' },
  statusKritis: { borderColor: 'rgba(183, 28, 28, 0.2)' },
  statusDingin: { borderColor: 'rgba(33, 150, 243, 0.2)' },
  statusOffline: { borderColor: 'rgba(148, 163, 184, 0.2)' },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconBgOptimal: { backgroundColor: '#E8F5E9' },
  iconBgWaspada: { backgroundColor: '#FFF3E0' },
  iconBgBahaya: { backgroundColor: '#FFEBEE' },
  iconBgKritis: { backgroundColor: '#FFCDD2' },
  iconBgDingin: { backgroundColor: '#E3F2FD' },
  iconBgOffline: { backgroundColor: '#F1F5F9' },

  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  statusText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  textOptimal: { color: '#2E7D32' },
  textWaspada: { color: '#E65100' },
  textBahaya: { color: '#C62828' },
  textKritis: { color: '#B71C1C' },
  textDingin: { color: '#1565C0' },
  textOffline: { color: '#94A3B8' },
  statusSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#1E293B',
  },
  seeAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.primary ?? '#2E7D32',
  },
  sensorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sensorCard: {
    width: (width - 64) / 2, // 24 padding each side (48) + 16 gap = 64
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sensorCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    padding: 4,
  },
  sensorValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 4,
    includeFontPadding: false,
  },
  sensorUnit: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  sensorLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoContent: {
    flex: 1,
    paddingRight: 16,
  },
  infoTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  infoIcon: {
    opacity: 0.8,
  },
  predictButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary ?? '#2E7D32',
    padding: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary ?? '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  predictIcon: {
    marginRight: 12,
  },
  predictButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  predictArrow: {
    marginLeft: 8,
  },
  bottomPadding: {
    height: 120,
  }
});

export default DashboardScreen;