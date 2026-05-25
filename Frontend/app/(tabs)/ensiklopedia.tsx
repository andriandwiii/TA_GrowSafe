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
// Karena data edukasi jamur tiram jarang berubah, sangat wajar (dan disarankan) 
// untuk menyimpannya secara statis di frontend (tidak perlu database/backend khusus).
const ENCYCLOPEDIA_DATA: EnsiklopediaItem[] = [
  {
    id: 'black-mold',
    name: 'Black Mold (Mucor spp.)',
    description: 'Black Mold atau kapang hitam adalah jenis kontaminasi jamur liar yang tumbuh pada media tanam (baglog). Sering dipicu oleh suhu ruangan yang terlalu panas dan sirkulasi udara yang buruk.',
    image: require('../../assets/images/penyakit_antraknosa.jpg'), 
    tag: { text: 'Bahaya', color: Colors.light.error ?? '#EF4444' },
  },
  {
    id: 'green-mold',
    name: 'Green Mold (Trichoderma)',
    description: 'Trichoderma adalah penyakit paling ganas pada budidaya jamur. Spora berwarna hijau ini menyebar sangat cepat dan memakan miselium jamur tiram. Baglog yang terkena harus segera dibuang.',
    image: require('../../assets/images/penyakit_phytophthora.jpg'), 
    tag: { text: 'Kritis', color: '#B91C1C' },
  },
  {
    id: 'neurospora',
    name: 'Orange Mold (Neurospora)',
    description: 'Kapang jingga atau oncom (Neurospora) sering muncul di ujung kapas baglog. Biasanya disebabkan oleh pasteurisasi serbuk kayu yang kurang matang atau kelembaban yang terlalu jenuh.',
    image: require('../../assets/images/penyakit_red_rust.jpg'), 
    tag: { text: 'Waspada', color: Colors.light.warning ?? '#F59E0B' },
  },
  {
    id: 'hama-gurem',
    name: 'Hama Gurem (Tungau)',
    description: 'Serangga kecil seperti kutu yang memakan miselium dan tubuh buah jamur. Tungau berkembang biak subur di lingkungan yang pengap, kotor, dan sirkulasi udaranya tertutup.',
    image: require('../../assets/images/penyakit_scab.jpg'), 
    tag: { text: 'Waspada', color: Colors.light.warning ?? '#F59E0B' },
  },
];

const EnsiklopediaScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Background Decor */}
      <View style={styles.bgDecorTop} />

      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <Text style={styles.headerTitle}>Ensiklopedia</Text>
        <Text style={styles.headerSubtitle}>Kamus referensi penyakit & hama Jamur Tiram</Text>
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
