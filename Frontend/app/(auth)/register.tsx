// ===================================================================
// File: register.tsx
// Lokasi: Frontend/app/(auth)/register.tsx
// Deskripsi: Form register GrowSafe dengan desain Bottom Sheet modern.
// Perbaikan:
//   - KeyboardAvoidingView lebih robust di Android
//   - Perbaiki stopPropagation → pakai Pressable agar kompatibel
//   - Link "Masuk di sini" pakai router.replace ke login (bukan router.back)
//   - Tambah accessibilityLabel dan hitSlop pada eye icon
//   - Tambah keyboardShouldPersistTaps pada ScrollView
// ===================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import Colors from '../../constants/Colors';
import Toast from 'react-native-toast-message';
import CustomLoading from '../../components/CustomLoading';

const RegisterScreen = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!nama.trim() || !email.trim() || !username.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Data Tidak Lengkap',
        text2: 'Semua kolom tidak boleh kosong.',
      });
      return;
    }
    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Password Terlalu Pendek',
        text2: 'Password minimal 8 karakter.',
      });
      return;
    }

    setIsLoading(true);
    const result = await register(nama.trim(), username.trim(), email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Pendaftaran Berhasil! 🎉',
        text2: 'Akun kamu sudah dibuat. Mengalihkan ke halaman masuk...',
      });
      setTimeout(() => {
        router.replace('/(auth)/login' as any);
      }, 2000);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Pendaftaran Gagal',
        text2: result.error || 'Terjadi kesalahan.',
      });
    }
  };

  return (
    // KeyboardAvoidingView: 'padding' di iOS, 'height' di Android lebih stabil
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Overlay gelap — tap untuk tutup modal */}
      <TouchableWithoutFeedback onPress={() => router.back()}>
        <View style={styles.overlay}>

          {/* Gunakan Pressable biasa agar stopPropagation kompatibel Android */}
          <Pressable onPress={() => {/* cegah bubble ke overlay */ }} style={styles.sheet}>

            {/* Handle drag */}
            <View style={styles.handle} />

            <Text style={styles.greetingText}>Bergabung dengan</Text>
            <Text style={styles.title}>GrowSafe</Text>

            {/* ScrollView agar bisa di-scroll di HP layar kecil */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Nama Lengkap */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.light.textSecondary ?? '#999'}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nama Lengkap"
                  placeholderTextColor={Colors.light.textSecondary ?? '#999'}
                  value={nama}
                  onChangeText={setNama}
                  autoCapitalize="words"
                  returnKeyType="next"
                  accessibilityLabel="Nama lengkap"
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.light.textSecondary ?? '#999'}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={Colors.light.textSecondary ?? '#999'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  accessibilityLabel="Email"
                />
              </View>

              {/* Username */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="at-outline"
                  size={20}
                  color={Colors.light.textSecondary ?? '#999'}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={Colors.light.textSecondary ?? '#999'}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  accessibilityLabel="Username"
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.light.textSecondary ?? '#999'}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min. 8 karakter)"
                  placeholderTextColor={Colors.light.textSecondary ?? '#999'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  accessibilityLabel="Password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  accessibilityLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.light.textSecondary ?? '#999'}
                  />
                </TouchableOpacity>
              </View>

              {/* Tombol Daftar */}
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { opacity: isLoading ? 0.7 : 1 },
                  { backgroundColor: pressed ? '#256528' : Colors.light.primary },
                ]}
                onPress={handleRegister}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Daftar"
              >
                {isLoading
                  ? <CustomLoading color="#FFFFFF" message="" />
                  : <Text style={styles.buttonText}>Daftar</Text>
                }
              </Pressable>

              {/* Navigasi ke Login */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>Sudah punya akun? </Text>
                {/* Pakai replace agar transisi modal mulus, bukan back */}
                <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)}>
                  <Text style={styles.switchLink}>Masuk di sini</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.textSecondary ?? '#888',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: Colors.light.text ?? '#111',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary ?? '#F5F5F5',
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: Colors.light.text ?? '#111',
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary ?? '#888',
  },
  switchLink: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.light.primary,
  },
});

export default RegisterScreen;