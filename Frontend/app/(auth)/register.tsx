// ===================================================================
// File: register.tsx
// Lokasi: Frontend/app/(auth)/register.tsx
// Deskripsi: Form register GrowSafe dengan desain Bottom Sheet modern.
// Perbaikan:
//   - KeyboardAvoidingView lebih robust di Android
//   - Link "Masuk di sini" pakai router.replace ke login (bukan router.back)
//   - Tambah accessibilityLabel dan hitSlop pada eye icon
//   - Tambah keyboardShouldPersistTaps pada ScrollView
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
  ScrollView,
  KeyboardAvoidingView,
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

const RegisterScreen = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

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
              <Text style={styles.greetingText}>Bergabung dengan</Text>
              <Text style={styles.title}>GrowSafe</Text>
            </View>

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
                  color="#94A3B8"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#94A3B8"
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
                  color="#94A3B8"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#94A3B8"
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
                  color="#94A3B8"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#94A3B8"
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
                  color="#94A3B8"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min. 8 karakter)"
                  placeholderTextColor="#94A3B8"
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
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              {/* Tombol Daftar */}
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { opacity: isLoading ? 0.7 : 1 },
                  { backgroundColor: pressed ? '#1B5E20' : Colors.light.primary ?? '#2E7D32' },
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
                <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)}>
                  <Text style={styles.switchLink}>Masuk di sini</Text>
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

export default RegisterScreen;