import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../constants/Colors';
import CustomLoading from '../components/CustomLoading';
import apiClient from '../services/api';
import { useAuth } from '../services/AuthContext';

const DetailPemantauanScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const { kumbungAktif } = useAuth();

  // State untuk data yang difetch
  const [data, setData] = useState({
    suhu: {
      saatIni: 0,
      rataRata: 0,
      maksimum: 0,
      minimum: 0,
      status: 'Memuat...'
    },
    kelembaban: {
      saatIni: 0,
      rataRata: 0,
      maksimum: 0,
      minimum: 0,
      status: 'Memuat...'
    },
    led: {
      saatIni: 0,
      status: 'Memuat...'
    },
    grafikMocks: [] as {jam: string, suhu: number, kelembaban: number}[]
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!kumbungAktif) return;
      const response = await apiClient.get(`/sensor/${kumbungAktif}/latest`);
      const { suhu, kelembaban, total_led_menyala } = response.data;
      
      let statusSuhu = 'Normal';
      if (suhu > 30) statusSuhu = 'Bahaya';
      else if (suhu > 28) statusSuhu = 'Peringatan';

      let statusKelembaban = 'Optimal';
      if (kelembaban > 90) statusKelembaban = 'Bahaya';
      else if (kelembaban > 85) statusKelembaban = 'Peringatan';

      // 2. Fetch data historis
      let historyData: any[] = [];
      try {
        const historyRes = await apiClient.get(`/sensor/${kumbungAktif}/history?limit=10`);
        historyData = historyRes.data || [];
      } catch (err) {
        console.log('Gagal fetch history:', err);
      }

      // Hitung min/max/avg dari history jika ada
      let avgSuhu = 0, maxSuhu = suhu || 0, minSuhu = suhu || 0;
      let avgKel = 0, maxKel = kelembaban || 0, minKel = kelembaban || 0;
      let chartData: {jam: string, suhu: number, kelembaban: number}[] = [];

      if (historyData.length > 0) {
        const suhus = historyData.map((d: any) => d.suhu);
        const kelembabans = historyData.map((d: any) => d.kelembaban);

        avgSuhu = Number((suhus.reduce((a, b) => a + b, 0) / suhus.length).toFixed(1));
        maxSuhu = Math.max(...suhus);
        minSuhu = Math.min(...suhus);

        avgKel = Number((kelembabans.reduce((a, b) => a + b, 0) / kelembabans.length).toFixed(1));
        maxKel = Math.max(...kelembabans);
        minKel = Math.min(...kelembabans);

        // Ambil 6 data terakhir untuk chart (reverse agar oldest first)
        const forChart = historyData.slice(0, 6).reverse();
        chartData = forChart.map((item: any) => {
          const date = new Date(item.created_at);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          
          return {
            jam: `${hours}:${minutes}`,
            // Konversi ke persentase tinggi bar (misal suhu max 50C, kelembaban max 100%)
            suhu: Math.min(Math.max((item.suhu / 50) * 100, 10), 100), 
            kelembaban: Math.min(Math.max((item.kelembaban / 100) * 100, 10), 100)
          };
        });
      }

      setData({
        suhu: { saatIni: suhu || 0, status: statusSuhu, rataRata: avgSuhu, maksimum: maxSuhu, minimum: minSuhu },
        kelembaban: { saatIni: kelembaban || 0, status: statusKelembaban, rataRata: avgKel, maksimum: maxKel, minimum: minKel },
        led: { saatIni: total_led_menyala || 0, status: total_led_menyala > 0 ? 'Menyala' : 'Mati' },
        grafikMocks: chartData
      });
    } catch (error) {
      console.log('Gagal fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [kumbungAktif]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomLoading message="Memuat Data Sensor..." />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" /><View style={styles.bgDecorTop} /><View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pemantauan</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}><Animated.View entering={FadeInDown.delay(100).springify()} style={styles.summaryContainer}><View style={styles.summaryCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBg, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="thermometer" size={20} color="#EF4444" />
              </View>
              <View style={[styles.badge, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.badgeText, { color: '#166534' }]}>{data.suhu.status}</Text>
              </View>
            </View>
            <Text style={styles.mainValue}>{data.suhu.saatIni}<Text style={styles.unitText}>°C</Text></Text>
            <Text style={styles.labelValue}>Suhu Ruangan</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statsLabel}>Rata-rata</Text>
                <Text style={styles.statsValue}>{data.suhu.rataRata}°</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View>
                <Text style={styles.statsLabel}>Tertinggi</Text>
                <Text style={[styles.statsValue, { color: '#EF4444' }]}>{data.suhu.maksimum}°</Text>
              </View>
            </View>
          </View><View style={styles.summaryCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBg, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="water" size={20} color="#0284C7" />
              </View>
              <View style={[styles.badge, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.badgeText, { color: '#166534' }]}>{data.kelembaban.status}</Text>
              </View>
            </View>
            <Text style={styles.mainValue}>{data.kelembaban.saatIni}<Text style={styles.unitText}>%</Text></Text>
            <Text style={styles.labelValue}>Kelembaban</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statsLabel}>Rata-rata</Text>
                <Text style={styles.statsValue}>{data.kelembaban.rataRata}%</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View>
                <Text style={styles.statsLabel}>Terendah</Text>
                <Text style={[styles.statsValue, { color: '#D97706' }]}>{data.kelembaban.minimum}%</Text>
              </View>
            </View>
          </View><View style={styles.summaryCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBg, { backgroundColor: '#FFF8E1' }]}>
                <Ionicons name="bulb" size={20} color="#FFB300" />
              </View>
              <View style={[styles.badge, { backgroundColor: data.led.status === 'Menyala' ? '#FEF3C7' : '#F1F5F9' }]}>
                <Text style={[styles.badgeText, { color: data.led.status === 'Menyala' ? '#B45309' : '#64748B' }]}>{data.led.status}</Text>
              </View>
            </View>
            <Text style={styles.mainValue}>{data.led.saatIni}</Text>
            <Text style={styles.labelValue}>Total LED Menyala</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statsLabel}>Mode</Text>
                <Text style={[styles.statsValue, {fontSize: 16}]}>Otomatis</Text>
              </View>
            </View>
          </View>
        </Animated.View><Animated.View entering={FadeInDown.delay(200).springify()} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Grafik Hari Ini</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Suhu</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#0284C7' }]} />
                <Text style={styles.legendText}>Kelembaban</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartArea}><View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} /><View style={styles.barsContainer}>
              {data.grafikMocks.map((item, index) => (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barColumn}><View style={[styles.bar, { height: `${item.kelembaban}%`, backgroundColor: '#BAE6FD' }]} /><View style={[styles.bar, styles.barTemp, { height: `${item.suhu}%`, backgroundColor: '#FCA5A5' }]} />
                  </View>
                  <Text style={styles.timeLabel}>{item.jam}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View><Animated.View entering={FadeInDown.delay(300).springify()} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text style={styles.insightTitle}>Analisis AI</Text>
          </View>
          <Text style={styles.insightText}>
            Suhu mengalami lonjakan pada pukul 12:00 namun sistem berhasil menurunkannya kembali. Tingkat kelembaban sangat stabil sejak pagi. Kondisi kumbung saat ini sangat ideal untuk pertumbuhan jamur.
          </Text>
        </Animated.View>

      </ScrollView>
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
    color: '#1E293B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  mainValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 42,
    color: '#1E293B',
    lineHeight: 48,
  },
  unitText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: '#64748B',
  },
  labelValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  statsLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statsValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#1E293B',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  chartArea: {
    height: 180,
    justifyContent: 'flex-end',
    position: 'relative',
    paddingBottom: 20,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    bottom: '50%',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 8,
  },
  barGroup: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barColumn: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 2,
  },
  bar: {
    width: 12,
    borderRadius: 4,
  },
  barTemp: {
    width: 12,
  },
  timeLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#94A3B8',
    position: 'absolute',
    bottom: -20,
  },
  insightCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 40,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#92400E',
    marginLeft: 8,
  },
  insightText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#92400E',
    lineHeight: 22,
  }
});

export default DetailPemantauanScreen;
