import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import Colors from '../constants/Colors';

// Tipe data notifikasi sesuai dengan deskripsi
type NotificationItem = {
  id_notifikasi: string;
  id_pengguna: string;
  id_prediksi: string;
  judul: string;
  isi: string;
  status_baca: 'Belum' | 'Sudah';
  created_at: string;
  kategori: 'Sedang' | 'Tinggi';
};

// Data mock (sementara)
const mockNotifications: NotificationItem[] = [
  {
    id_notifikasi: 'NTF001',
    id_pengguna: 'USR001',
    id_prediksi: 'PRD005',
    judul: '🚨 BAHAYA! Risiko Black Mold Sangat Tinggi',
    isi: "Kumbung 'Kumbung 1' menunjukkan risiko black mold 82.1%!\nSegera periksa dan isolasi baglog yang terinfeksi.",
    status_baca: 'Belum',
    created_at: '2025-07-01 14:30:00',
    kategori: 'Tinggi',
  },
  {
    id_notifikasi: 'NTF002',
    id_pengguna: 'USR001',
    id_prediksi: 'PRD004',
    judul: '⚠️ Peringatan Risiko Black Mold',
    isi: "Kumbung 'Kumbung 1' menunjukkan risiko black mold 55.3%.\nLakukan tindakan pencegahan segera.",
    status_baca: 'Sudah',
    created_at: '2025-06-30 09:15:00',
    kategori: 'Sedang',
  }
];

const NotifikasiScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const unreadCount = notifications.filter(n => n.status_baca === 'Belum').length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id_notifikasi === id ? { ...n, status_baca: 'Sudah' } : n)
    );
  };

  const markAllAsRead = () => {
    if (unreadCount === 0) return;
    
    Alert.alert('Tandai Semua Dibaca', 'Apakah Anda yakin ingin menandai semua notifikasi telah dibaca?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Ya', 
        onPress: () => {
          setNotifications(prev => prev.map(n => ({ ...n, status_baca: 'Sudah' })));
        } 
      }
    ]);
  };

  const deleteNotification = (id: string) => {
    Alert.alert('Hapus Notifikasi', 'Apakah Anda yakin ingin menghapus notifikasi ini?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Hapus', 
        style: 'destructive',
        onPress: () => {
          setNotifications(prev => prev.filter(n => n.id_notifikasi !== id));
        } 
      }
    ]);
  };

  const handlePressNotification = (item: NotificationItem) => {
    if (item.status_baca === 'Belum') {
      markAsRead(item.id_notifikasi);
    }
    // Arahkan ke halaman detail prediksi berdasarkan id_prediksi (bisa disesuaikan route-nya)
    router.push(`/detail/${item.id_prediksi}` as any);
  };

  // Fungsi untuk memformat tanggal (sederhana)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()} • ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item, index }: { item: NotificationItem, index: number }) => {
    const isUnread = item.status_baca === 'Belum';
    const isHighRisk = item.kategori === 'Tinggi';
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()} exiting={FadeOutUp}>
        <TouchableOpacity 
          style={[styles.notificationCard, isUnread && styles.unreadCard]}
          activeOpacity={0.7}
          onPress={() => handlePressNotification(item)}
        >
          {/* Ikon Kiri */}
          <View style={[styles.iconContainer, isHighRisk ? styles.iconHigh : styles.iconMedium]}>
            <Text style={{ fontSize: 24 }}>{isHighRisk ? '🚨' : '⚠️'}</Text>
          </View>
          
          {/* Konten Teks */}
          <View style={styles.textContainer}>
            <View style={styles.cardHeader}>
              <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={2}>
                {item.judul}
              </Text>
              {isUnread && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.message} numberOfLines={2}>{item.isi}</Text>
            <Text style={styles.time}>{formatDate(item.created_at)}</Text>
          </View>

          {/* Tombol Hapus */}
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => deleteNotification(item.id_notifikasi)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
        <Text style={styles.headerTitle}>Notifikasi</Text>
        
        <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
          <Ionicons name="checkmark-done-outline" size={24} color={unreadCount > 0 ? Colors.light.primary : '#CBD5E1'} />
        </TouchableOpacity>
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          {unreadCount > 0 ? `Anda memiliki ${unreadCount} pesan baru` : 'Tidak ada pesan baru'}
        </Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id_notifikasi}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Belum ada notifikasi</Text>
          </View>
        }
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
    paddingBottom: 8,
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
    fontSize: 20,
    color: '#1E293B',
  },
  markAllButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeader: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  subHeaderText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)', // Border hijau tipis jika belum dibaca
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconHigh: {
    backgroundColor: '#FEE2E2',
  },
  iconMedium: {
    backgroundColor: '#FEF3C7',
  },
  textContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#334155',
    flex: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  titleUnread: {
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary ?? '#2E7D32',
    marginTop: 4,
  },
  message: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  time: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#94A3B8',
  },
});

export default NotifikasiScreen;
