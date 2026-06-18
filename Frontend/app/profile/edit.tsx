import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../services/AuthContext';
import Colors from '../../constants/Colors';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.nama || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !username || !email) {
      Toast.show({
        type: 'error',
        text1: 'Validasi Gagal',
        text2: 'Semua field harus diisi.',
      });
      return;
    }

    setIsLoading(true);
    const result = await updateProfile({ nama: name, username, email });
    setIsLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Berhasil',
        text2: 'Profil Anda telah berhasil diperbarui.',
      });
      router.back();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Gagal',
        text2: result.error || 'Terjadi kesalahan saat menyimpan profil.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.bgDecorTop} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profilePicContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Masukkan nama" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Masukkan email" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="at-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Masukkan username" autoCapitalize="none" />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Button */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && { opacity: 0.7 }]} 
          onPress={handleSave} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  bgDecorTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, backgroundColor: '#E8F5E9', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, opacity: 0.5 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#1E293B' },
  content: { padding: 24, paddingBottom: 100 },
  profilePicContainer: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.light.primary ?? '#2E7D32', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFFFFF', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  avatarText: { fontFamily: 'Poppins-Bold', fontSize: 36, color: '#FFFFFF' },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Poppins-Medium', fontSize: 13, color: '#475569', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 52 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: 14, color: '#1E293B', height: '100%' },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 30, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  saveButton: { backgroundColor: Colors.light.primary ?? '#2E7D32', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.light.primary ?? '#2E7D32', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveButtonText: { fontFamily: 'Poppins-Bold', fontSize: 16, color: '#FFFFFF' }
});
