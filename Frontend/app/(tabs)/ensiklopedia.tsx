// ===================================================================
// File: ensiklopedia.tsx
// Lokasi: Frontend/app/(tabs)/ensiklopedia.tsx
// Deskripsi: Halaman untuk menampilkan daftar penyakit dalam format kartu.
// ===================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import EnsiklopediaCard, { EnsiklopediaItem } from '../../components/EnsiklopediaCard';

// Data ensiklopedia disimpan secara built-in di dalam aplikasi.
// Pastikan Anda sudah menyiapkan gambar-gambar ini di folder assets/images.
const ENCYCLOPEDIA_DATA: EnsiklopediaItem[] = [
  {
    id: 'antraknosa',
    name: 'Antraknosa',
    description: 'Antraknosa adalah salah satu penyakit paling merusak pada tanaman jambu biji, terutama di daerah tropis dengan kelembapan tinggi...',
    image: require('../../assets/images/penyakit_antraknosa.jpg'), 
    tag: { text: 'Bahaya', color: Colors.light.error ?? '#EF4444' },
  },
  {
    id: 'phytophthora',
    name: 'Phytophthora',
    description: 'Penyakit Phytophthora sangat agresif dan cepat menyebar, disebabkan oleh organisme mirip jamur yang hidup di tanah...',
    image: require('../../assets/images/penyakit_phytophthora.jpg'), 
    tag: { text: 'Bahaya', color: Colors.light.error ?? '#EF4444' },
  },
  {
    id: 'red-rust',
    name: 'Red Rust',
    description: 'Berbeda dengan penyakit lainnya, Red Rust tidak disebabkan oleh jamur, melainkan oleh alga parasit. Penyakit ini umumnya tidak mematikan...',
    image: require('../../assets/images/penyakit_red_rust.jpg'), 
    tag: { text: 'Waspada', color: Colors.light.warning ?? '#F59E0B' },
  },
  {
    id: 'scab',
    name: 'Scab',
    description: 'Penyakit Scab atau Kudis adalah penyakit jamur yang secara spesifik merusak penampilan luar buah dan daun...',
    image: require('../../assets/images/penyakit_scab.jpg'), 
    tag: { text: 'Waspada', color: Colors.light.warning ?? '#F59E0B' },
  },
];


const EnsiklopediaScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />
      
      {/* Background Decor */}
      <View style={styles.bgDecorTop} />

      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <Text style={styles.headerTitle}>Ensiklopedia</Text>
        <Text style={styles.headerSubtitle}>Kamus referensi deteksi penyakit tanaman</Text>
      </Animated.View>

      <FlatList
        data={ENCYCLOPEDIA_DATA}
        renderItem={({ item, index }) => <EnsiklopediaCard item={item} index={index} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  header: {
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
});

export default EnsiklopediaScreen;
