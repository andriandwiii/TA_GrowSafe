import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../services/AuthContext';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.bgDecorTop} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Saya</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.content}>

          {/* Profile Avatar Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.nama || 'Pengguna'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@contoh.com'}</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>@{user?.username || 'username'}</Text>
            </View>
          </View>

          {/* Menu Section */}
          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Pengaturan Akun</Text>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/profile/edit' as any)}>
              <View style={[styles.menuIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="person-outline" size={20} color="#0284C7" />
              </View>
              <Text style={styles.menuText}>Edit Profil</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/profile/password' as any)}>
              <View style={[styles.menuIcon, { backgroundColor: '#FEF08A' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#CA8A04" />
              </View>
              <Text style={styles.menuText}>Ganti Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/profile/kumbung' as any)}>
              <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
              </View>
              <Text style={styles.menuText}>Pengaturan Kumbung</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Lainnya</Text>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/profile/bantuan' as any)}>
              <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="help-circle-outline" size={20} color="#4B5563" />
              </View>
              <Text style={styles.menuText}>Pusat Bantuan</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={styles.logoutText}>Keluar</Text>
            </TouchableOpacity>
          </View>

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
    height: 220,
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    opacity: 0.5,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.light.primary ?? '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#E8F5E9',
  },
  avatarText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    color: '#FFFFFF',
  },
  userName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#475569',
  },
  menuContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#334155',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 8,
  },
});

export default ProfileScreen;