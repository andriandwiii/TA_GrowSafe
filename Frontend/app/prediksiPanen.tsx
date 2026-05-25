import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../constants/Colors';
import CustomLoading from '../components/CustomLoading';

const { width } = Dimensions.get('window');

const PrediksiPanenScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data sesuai dengan contoh gambar/output dari user
  const predictionData = {
    estimasiPanen: 26.8,
    jumlahBaglog: 100,
    risiko: 33.02,
    efisiensi: 67.0,
    kategoriRisiko: 'Rendah',
    panenTanpaRisiko: 40.0,
    estimasiKerugian: -13.2,
    rumus: 'panen = 100 baglog × 0.4 kg × (1 − 33.0% / 100) = 100 × 0.4 × 0.6698 = 26.79 kg',
    rekomendasi: 'Kondisi Baik. Pertahankan kondisi saat ini. Pantau sensor secara rutin. Tidak diperlukan intervensi khusus.',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />

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

      {isLoading ? (
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
              <Text style={styles.gridLabel}>RISIKO BLACK MOLD</Text>
              <Text style={[styles.gridValue, { color: '#059669' }]}>{predictionData.risiko}%</Text>
            </View>

            {/* Card Kategori */}
            <View style={styles.gridCard}>
              <Text style={styles.gridLabel}>KATEGORI RISIKO</Text>
              <View style={styles.categoryBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.categoryText}>{predictionData.kategoriRisiko}</Text>
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
          </Animated.View>

          {/* Rekomendasi */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.recommendationCard}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" style={{ marginTop: 2 }} />
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
