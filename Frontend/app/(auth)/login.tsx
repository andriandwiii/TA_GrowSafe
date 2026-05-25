// ===================================================================
// File: login.tsx
// Lokasi: Frontend/app/(auth)/login.tsx
// Deskripsi: Form login GrowSafe dengan desain Bottom Sheet modern.
// Perbaikan:
//   - Tambah ScrollView agar tidak overflow di HP kecil
//   - KeyboardAvoidingView lebih robust di Android
//   - Perbaiki potensi bug stopPropagation di Android
//   - Tambah accessibilityLabel
// ===================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import Colors from '../../constants/Colors';
import Toast from 'react-native-toast-message';
import CustomLoading from '../../components/CustomLoading';

const LoginScreen = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Data Tidak Lengkap',
        text2: 'Username/Email dan password tidak boleh kosong.',
      });
      return;
    }
    setIsLoading(true);
    const result = await login(usernameOrEmail.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Login Gagal',
        text2: result.error || 'Terjadi kesalahan saat login.',
      });
    }
    // Jika sukses, AuthContext update state → navigasi otomatis dari root _layout
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

          {/* Gunakan Pressable biasa + stopPropagation manual agar kompatibel Android */}
          <Pressable onPress={() => {/* cegah bubble ke overlay */ }} style={styles.sheet}>

            {/* Handle drag */}
            <View style={styles.handle} />

            {/* Konten sheet dibungkus ScrollView agar aman di HP kecil */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <Text style={styles.greetingText}>Halo,</Text>
              <Text style={styles.title}>Selamat Datang Kembali!</Text>

              {/* Username / Email */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.light.textSecondary ?? '#999'}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Username atau Email"
                  placeholderTextColor={Colors.light.textSecondary ?? '#999'}
                  value={usernameOrEmail}
                  onChangeText={setUsernameOrEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  accessibilityLabel="Username atau Email"
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
                  placeholder="Password"
                  placeholderTextColor={Colors.light.textSecondary ?? '#999'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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

              {/* Tombol Masuk */}
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { opacity: isLoading ? 0.7 : 1 },
                  { backgroundColor: pressed ? '#256528' : Colors.light.primary },
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Masuk"
              >
                {isLoading
                  ? <CustomLoading color="#FFFFFF" message="" />
                  : <Text style={styles.buttonText}>Masuk</Text>
                }
              </Pressable>

              {/* Navigasi ke Register */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>Belum punya akun? </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)/register' as any)}>
                  <Text style={styles.switchLink}>Daftar di sini</Text>
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

export default LoginScreen;