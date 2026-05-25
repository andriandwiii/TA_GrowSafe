import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import Colors from '../../constants/Colors';

export default function PasswordScreen() {
  const router = useRouter();
  
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSave = () => {
    if (!oldPass || !newPass || !confirmPass) {
      Toast.show({
        type: 'error',
        text1: 'Data Tidak Lengkap',
        text2: 'Semua kolom harus diisi.',
      });
      return;
    }
    if (newPass !== confirmPass) {
      Toast.show({
        type: 'error',
        text1: 'Password Tidak Cocok',
        text2: 'Password baru dan konfirmasi password tidak cocok.',
      });
      return;
    }
    
    Toast.show({
      type: 'success',
      text1: 'Berhasil',
      text2: 'Password Anda telah berhasil diperbarui.',
    });
    router.back();
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
        <Text style={styles.headerTitle}>Ganti Password</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.illustration}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={48} color="#CA8A04" />
          </View>
          <Text style={styles.subtitle}>Buat password yang kuat untuk menjaga keamanan akun Anda.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password Saat Ini</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={oldPass} onChangeText={setOldPass} secureTextEntry={!showPass} placeholder="Masukkan password saat ini" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password Baru</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={newPass} onChangeText={setNewPass} secureTextEntry={!showPass} placeholder="Masukkan password baru" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Password Baru</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="shield-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput style={styles.input} value={confirmPass} onChangeText={setConfirmPass} secureTextEntry={!showPass} placeholder="Ulangi password baru" />
            </View>
          </View>

          <TouchableOpacity style={styles.showPassToggle} onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
            <Text style={styles.showPassText}>{showPass ? 'Sembunyikan Password' : 'Tampilkan Password'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Perbarui Password</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  bgDecorTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, backgroundColor: '#FEF9C3', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, opacity: 0.5 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#1E293B' },
  content: { padding: 24, paddingBottom: 100 },
  illustration: { alignItems: 'center', marginBottom: 32 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FEF08A', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  subtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Poppins-Medium', fontSize: 13, color: '#475569', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 52 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: 14, color: '#1E293B', height: '100%' },
  showPassToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  showPassText: { fontFamily: 'Poppins-Medium', fontSize: 14, color: '#64748B', marginLeft: 8 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 30, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  saveButton: { backgroundColor: '#CA8A04', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#CA8A04', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveButtonText: { fontFamily: 'Poppins-Bold', fontSize: 16, color: '#FFFFFF' }
});
