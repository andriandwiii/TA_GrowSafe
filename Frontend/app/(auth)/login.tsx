// ===================================================================
// File: login.tsx
// Lokasi: Frontend/app/(auth)/login.tsx
// Deskripsi: Form login GrowSafe dengan desain Bottom Sheet modern.
// Perbaikan:
//   - Tambah ScrollView agar tidak overflow di HP kecil
//   - KeyboardAvoidingView lebih robust di Android
//   - Perbaiki potensi bug stopPropagation di Android
//   - Tambah accessibilityLabel
//   - Menggunakan Animated & PanResponder agar bisa dislide ke bawah beneran
//   - Pembaruan tema warna agar senada dengan halaman lain (Dashboard)
// ===================================================================

import React, { useState, useRef } from 'react';
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
  Animated,
  PanResponder,
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

  // Animasi Bottom Sheet
  const panY = useRef(new Animated.Value(0)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: 1000, // geser ke bawah sejauh 1000px untuk menutup
    duration: 300,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Aktifkan pan responder jika ditarik ke bawah (vertikal > 10)
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        // Hanya izinkan ditarik ke bawah
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 1.5) {
          // Tutup modal jika ditarik cukup jauh atau cepat
          closeAnim.start(() => router.back());
        } else {
          // Kembalikan ke posisi semula
          resetPositionAnim.start();
        }
      },
    })
  ).current;

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
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={() => closeAnim.start(() => router.back())}>
        <View style={styles.overlay}>
          {/* Animated.View menampung bottom sheet agar bisa dianimasikan Y-nya */}
          <Animated.View 
            style={[
              styles.sheet, 
              { transform: [{ translateY: panY }] }
            ]}
          >
            {/* Area drag: Handle bar dan teks judul */}
            <View {...panResponder.panHandlers} style={styles.dragArea}>
              <View style={styles.handle} />
              <Text style={styles.greetingText}>Halo,</Text>
              <Text style={styles.title}>Selamat Datang Kembali!</Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Username / Email */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#94A3B8"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Username atau Email"
                  placeholderTextColor="#94A3B8"
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
                  color="#94A3B8"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
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
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              {/* Tombol Masuk */}
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { opacity: isLoading ? 0.7 : 1 },
                  { backgroundColor: pressed ? '#1B5E20' : Colors.light.primary ?? '#2E7D32' },
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
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.6)', // Gelap dengan tone kebiruan
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dragArea: {
    paddingBottom: 16,
    // Area ini yang merespon gestur slide ke bawah
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1E293B',
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  switchLink: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.light.primary ?? '#2E7D32',
  },
});

export default LoginScreen;