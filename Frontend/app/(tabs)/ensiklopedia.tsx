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
  SafeAreaView,
  StatusBar,
} from 'react-native';
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
    tag: { text: 'Bahaya', color: Colors.light.error },
  },
  {
    id: 'phytophthora',
    name: 'Phytophthora',
    description: 'Penyakit Phytophthora sangat agresif dan cepat menyebar, disebabkan oleh organisme mirip jamur yang hidup di tanah...',
    image: require('../../assets/images/penyakit_phytophthora.jpg'), 
    tag: { text: 'Bahaya', color: Colors.light.error },
  },
  {
    id: 'red-rust',
    name: 'Red Rust',
    description: 'Berbeda dengan penyakit lainnya, Red Rust tidak disebabkan oleh jamur, melainkan oleh alga parasit. Penyakit ini umumnya tidak mematikan...',
    image: require('../../assets/images/penyakit_red_rust.jpg'), 
    tag: { text: 'Waspada', color: Colors.light.warning },
  },
  {
    id: 'scab',
    name: 'Scab',
    description: 'Penyakit Scab atau Kudis adalah penyakit jamur yang secara spesifik merusak penampilan luar buah dan daun...',
    image: require('../../assets/images/penyakit_scab.jpg'), 
    tag: { text: 'Waspada', color: Colors.light.warning },
  },
];


const EnsiklopediaScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={ENCYCLOPEDIA_DATA}
        renderItem={({ item }) => <EnsiklopediaCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
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
});

export default EnsiklopediaScreen;
