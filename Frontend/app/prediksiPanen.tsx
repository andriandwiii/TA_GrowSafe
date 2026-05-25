import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../constants/Colors';
import CustomLoading from '../components/CustomLoading';
import apiClient from '../services/api';
import { useAuth } from '../services/AuthContext';

const { width } = Dimensions.get('window');

const PrediksiPanenScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const { kumbungAktif } = useAuth();
  const [predictionData, setPredictionData] = useState<any>(null);

  useEffect(() => {
    const runPrediction = async () => {
      if (!kumbungAktif) return;
      try {
        setIsLoading(true);

        // 1. Ambil data sensor terbaru
        let suhu = 25.0;
        let kelembaban = 80.0;
        let total_led_menyala = 0;
        try {
          const sensorRes = await apiClient.get(`/sensor/${kumbungAktif}/latest`);
          if (sensorRes.data) {
            suhu = sensorRes.data.suhu;
            kelembaban = sensorRes.data.kelembaban;
            total_led_menyala = sensorRes.data.total_led_menyala || 0;
          }
        } catch (e) {
          console.log('Tidak ada data sensor terbaru, menggunakan default');
        }

        // 2. Ambil id_yolo terbaru dari riwayat
        let id_yolo = null;
        try {
          const deteksiRes = await apiClient.get(`/history/deteksi/${kumbungAktif}?limit=1`);
          if (deteksiRes.data && deteksiRes.data.length > 0) {
            id_yolo = deteksiRes.data[0].id_yolo;
          }
        } catch (e) {
          console.log('Tidak ada histori deteksi terbaru');
        }

        // 3. Ambil data kumbung untuk mendapatkan kapasitas baglog
        let kapasitasBaglog = 100;
        try {
          const kumbungRes = await apiClient.get(`/kumbung/${kumbungAktif}`);
          if (kumbungRes.data && kumbungRes.data.kapasitas_baglog) {
            kapasitasBaglog = kumbungRes.data.kapasitas_baglog;
          }
        } catch (e) {
          console.log('Gagal mengambil data kumbung');
        }

        // 4. Panggil POST /predict/risk
        const formData = new FormData();
        formData.append('id_kumbung', kumbungAktif);
        formData.append('suhu', suhu.toString());
        formData.append('kelembaban', kelembaban.toString());
        formData.append('total_led_menyala', total_led_menyala.toString());
        if (id_yolo) {
          formData.append('id_yolo', id_yolo);
        }

        const predictRes = await apiClient.post('/predict/risk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const result = predictRes.data;
        const risiko = result.risk_persen || 0;
        const efisiensi = 100 - risiko;
        const estimasiPanen = result.predicted_panen_kg || 0;
        const panenTanpaRisiko = kapasitasBaglog * 0.4;
        const estimasiKerugian = panenTanpaRisiko - estimasiPanen;

        setPredictionData({
          estimasiPanen: estimasiPanen.toFixed(2),
          jumlahBaglog: kapasitasBaglog,
          risiko: risiko.toFixed(2),
          efisiensi: efisiensi.toFixed(1),
          kategoriRisiko: result.kategori_risiko || 'Aman',
          panenTanpaRisiko: panenTanpaRisiko.toFixed(2),
          estimasiKerugian: estimasiKerugian > 0 ? `-${estimasiKerugian.toFixed(2)}` : '0',
          rumus: `panen = ${kapasitasBaglog} baglog × 0.4 kg × (1 − ${risiko.toFixed(1)}% / 100) = ${estimasiPanen.toFixed(2)} kg`,
          rekomendasi: result.rekomendasi_risiko || 'Kondisi baik, tidak ada rekomendasi spesifik.',
        });

      } catch (error) {
        console.error('Error saat melakukan prediksi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    runPrediction();
  }, [kumbungAktif]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />

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
        <Text style={styles.headerTitle}>Potensi Panen</Text>
        <View style={{ width: 44 }} />
      </View>

      {isLoading || !predictionData ? (
        <CustomLoading fullScreen message="Menganalisis potensi panen..." />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Main Prediction Card */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.mainCard}>
            <View style={styles.mainCardHeader}>
              <Ionicons name="leaf" size={20} color="#2E7D32" style={{ marginRight: 8 }} />
              <Text style={styles.mainCardTitle}>PREDIKSI POTENSI PANEN</Text>
            </View>

            <View style={styles.yieldContainer}>
              <Text style={styles.yieldNumber}>{predictionData.estimasiPanen}</Text>
              <Text style={styles.yieldUnit}>kg estimasi panen</Text>
            </View>

            <View style={styles.yieldSubtextContainer}>
              <Text style={styles.yieldSubtext}>
                Dari {predictionData.jumlahBaglog} baglog · Risiko: {Math.round(predictionData.risiko)}% · Efisiensi panen: {predictionData.efisiensi}%
              </Text>
            </View>
          </Animated.View>

          {/* Grid Statistik */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.gridContainer}>
            {/* Card Risiko */}
            <View style={styles.gridCard}>
              <Text style={styles.gridLabel}>RISIKO KONTAMINASI</Text>
              <Text style={[styles.gridValue, { color: predictionData.risiko > 30 ? '#EF4444' : '#059669' }]}>{predictionData.risiko}%</Text>
            </View>

            {/* Card Kategori */}
            <View style={styles.gridCard}>
              <Text style={styles.gridLabel}>KATEGORI RISIKO</Text>
              <View style={styles.categoryBadge}>
                <Ionicons name={predictionData.risiko > 30 ? "warning" : "checkmark-circle"} size={16} color={predictionData.risiko > 30 ? "#EF4444" : "#059669"} style={{ marginRight: 4 }} />
                <Text style={[styles.categoryText, { color: predictionData.risiko > 30 ? "#EF4444" : "#059669" }]}>{predictionData.kategoriRisiko}</Text>
              </View>
            </View>

            {/* Card Panen Maksimal */}
            <View style={styles.gridCard}>
              <Text style={styles.gridLabel}>PANEN TANPA RISIKO</Text>
              <Text style={styles.gridValue}>{predictionData.panenTanpaRisiko} kg</Text>
            </View>

            {/* Card Kerugian */}
            <View style={styles.gridCard}>
              <Text style={styles.gridLabel}>ESTIMASI KERUGIAN</Text>
              <Text style={[styles.gridValue, { color: '#EF4444' }]}>{predictionData.estimasiKerugian} kg</Text>
            </View>
          </Animated.View>

          {/* Rumus Perhitungan */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.formulaCard}>
            <Text style={styles.formulaText}>{predictionData.rumus}</Text>
            <Text style={[styles.formulaText, { fontSize: 11, color: '#64748B', marginTop: 12, fontStyle: 'italic', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8 }]}>
              *Asumsi: 0.4 kg adalah rata-rata standar produktivitas/hasil panen ideal yang dapat dihasilkan oleh 1 baglog jamur tiram selama satu siklus hidupnya.
            </Text>
          </Animated.View>

          {/* Rekomendasi */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.recommendationCard}>
            <Ionicons name="information-circle" size={24} color="#059669" style={{ marginTop: 2 }} />
            <Text style={styles.recommendationText}>{predictionData.rekomendasi}</Text>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    height: 220,
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    opacity: 0.5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.1)',
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  mainCardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  yieldContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  yieldNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 64,
    color: Colors.light.primary ?? '#2E7D32',
    includeFontPadding: false,
    lineHeight: 70,
  },
  yieldUnit: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  yieldSubtextContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  yieldSubtext: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCard: {
    width: (width - 40 - 16) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  gridLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  gridValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#1E293B',
    textAlign: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#059669',
  },
  formulaCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formulaText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'flex-start',
  },
  recommendationText: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#065F46',
    marginLeft: 12,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 40,
  }
});

export default PrediksiPanenScreen;
