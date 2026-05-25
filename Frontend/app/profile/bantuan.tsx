import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function BantuanScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: 'Bagaimana cara alat mendeteksi penyakit?',
      answer: 'Alat menggunakan kamera untuk mendeteksi citra (gambar) dari baglog jamur, kemudian dianalisis menggunakan teknologi AI (YOLO) untuk mengetahui ada tidaknya kontaminasi seperti Black Mold.'
    },
    {
      id: 2,
      question: 'Apa yang harus dilakukan jika terdeteksi Bahaya?',
      answer: 'Segera pisahkan baglog yang terinfeksi dari baglog sehat lainnya. Kemudian turunkan kelembaban ruangan dan tingkatkan sirkulasi udara di dalam kumbung Anda.'
    },
    {
      id: 3,
      question: 'Seberapa akurat prediksi panen yang dihasilkan?',
      answer: 'Prediksi dihitung menggunakan regresi linear berdasarkan parameter lingkungan (suhu & kelembaban) historis. Akurasinya sangat bergantung pada kestabilan sensor dan jumlah data historis.'
    },
    {
      id: 4,
      question: 'Sensor IoT offline, apa solusinya?',
      answer: 'Pastikan alat terhubung ke daya listrik dan jaringan WiFi. Jika masih offline, coba restart alat dengan mencabut dan memasang kembali sumber daya listriknya.'
    }
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContactSupport = () => {
    // Simulasi membuka WhatsApp atau Email
    Linking.openURL('mailto:support@growsafe.id').catch(() => {
      console.log('Error opening mail client');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />
      <View style={styles.bgDecorTop} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pusat Bantuan</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="help-buoy" size={42} color="#0284C7" />
          </View>
          <Text style={styles.titleText}>Halo, ada yang bisa kami bantu?</Text>
          <Text style={styles.subtitleText}>Temukan jawaban cepat atas pertanyaan Anda di bawah ini.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.faqContainer}>
          <Text style={styles.sectionTitle}>Pertanyaan Populer (FAQ)</Text>
          
          {faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity 
                  style={styles.faqHeader} 
                  onPress={() => toggleExpand(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQuestion, isExpanded && { color: '#0284C7' }]}>
                    {faq.question}
                  </Text>
                  <Ionicons 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={isExpanded ? '#0284C7' : '#94A3B8'} 
                  />
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.contactCard}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Masih butuh bantuan?</Text>
            <Text style={styles.contactDesc}>Tim teknis kami siap membantu Anda menyelesaikan masalah.</Text>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
            <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.contactButtonText}>Hubungi Kami</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  bgDecorTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, backgroundColor: '#E0F2FE', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, opacity: 0.5 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#1E293B' },
  content: { padding: 24, paddingBottom: 40 },
  headerSection: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#BAE6FD', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  titleText: { fontFamily: 'Poppins-Bold', fontSize: 22, color: '#1E293B', textAlign: 'center', marginBottom: 8 },
  subtitleText: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 },
  faqContainer: { marginBottom: 32 },
  sectionTitle: { fontFamily: 'Poppins-Bold', fontSize: 16, color: '#1E293B', marginBottom: 16 },
  faqCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  faqQuestion: { flex: 1, fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#334155', paddingRight: 16 },
  faqAnswerContainer: { padding: 16, paddingTop: 0, backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  faqAnswer: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#475569', lineHeight: 22, marginTop: 12 },
  contactCard: { backgroundColor: '#0284C7', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#0284C7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  contactInfo: { alignItems: 'center', marginBottom: 20 },
  contactTitle: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#FFFFFF', marginBottom: 8 },
  contactDesc: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#E0F2FE', textAlign: 'center', lineHeight: 20 },
  contactButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  contactButtonText: { fontFamily: 'Poppins-Bold', fontSize: 15, color: '#0284C7' }
});
