import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';

export default function EncyclopediaDetailScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();

  const formattedName = typeof name === 'string' ? name.replace(/-/g, ' ').toUpperCase() : 'PENYAKIT JAMUR';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />
      
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
        <Text style={styles.headerTitle}>Detail Edukasi</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1613342376994-db13a48e89f9?auto=format&fit=crop&q=80&w=400' }} 
            style={styles.heroImage} 
          />
          <View style={styles.titleOverlay}>
            <Text style={styles.diseaseName}>{formattedName}</Text>
            <Text style={styles.latinName}>Mucor spp. / Trichoderma spp.</Text>
          </View>
        </Animated.View>

        <View style={styles.contentWrapper}>
          {/* Card Deskripsi */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="information" size={20} color="#0284C7" />
              </View>
              <Text style={styles.cardTitle}>Deskripsi</Text>
            </View>
            <Text style={styles.paragraph}>
              Penyakit ini merupakan salah satu kontaminan paling umum dalam budidaya jamur. Spora jamur patogen ini menyebar lewat udara dan sangat cepat berkembang biak pada media baglog yang lembab dan bersuhu tinggi melebihi batas optimal.
            </Text>
          </Animated.View>

          {/* Card Gejala */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="warning" size={20} color="#D97706" />
              </View>
              <Text style={styles.cardTitle}>Gejala Visual</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.paragraph}>Munculnya miselium atau noda berwarna hitam/hijau pada permukaan baglog.</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.paragraph}>Miselium jamur utama (putih) berhenti tumbuh dan mati.</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.paragraph}>Tercium bau asam atau busuk dari media tanam.</Text>
            </View>
          </Animated.View>

          {/* Card Pencegahan */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#166534" />
              </View>
              <Text style={styles.cardTitle}>Cara Pencegahan</Text>
            </View>
            <View style={styles.numberRow}>
              <Text style={styles.numberText}>1</Text>
              <Text style={styles.paragraph}>Lakukan sterilisasi baglog dengan suhu dan waktu yang tepat sebelum inokulasi.</Text>
            </View>
            <View style={styles.numberRow}>
              <Text style={styles.numberText}>2</Text>
              <Text style={styles.paragraph}>Jaga sirkulasi udara kumbung dan hindari kelembaban di atas 90% secara terus-menerus.</Text>
            </View>
            <View style={styles.numberRow}>
              <Text style={styles.numberText}>3</Text>
              <Text style={styles.paragraph}>Gunakan bibit F2 yang berkualitas dan bebas dari kontaminasi.</Text>
            </View>
          </Animated.View>
        </View>
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
    paddingBottom: 40 
  },
  heroContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    height: 240,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  heroImage: { 
    width: '100%', 
    height: '100%',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.4)', // Gradient mock
  },
  diseaseName: { 
    fontFamily: 'Poppins-Bold', 
    fontSize: 22, 
    color: '#FFFFFF', 
    marginBottom: 4 
  },
  latinName: { 
    fontFamily: 'Poppins-Medium', 
    fontSize: 13, 
    color: '#E2E8F0', 
    fontStyle: 'italic'
  },
  contentWrapper: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
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
    marginBottom: 12 
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: { 
    fontFamily: 'Poppins-Bold', 
    fontSize: 16, 
    color: '#1E293B',
  },
  paragraph: { 
    flex: 1,
    fontFamily: 'Poppins-Regular', 
    fontSize: 13, 
    color: '#475569', 
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginTop: 8,
    marginRight: 12,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  numberText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: '#166534',
    marginRight: 12,
    marginTop: 2,
  }
});