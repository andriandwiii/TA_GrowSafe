// ===================================================================
// File: login.tsx
// Lokasi: Frontend/app/(auth)/login.tsx
// Deskripsi: Diperbarui agar modal bisa ditutup saat menekan di luar area form.
// ===================================================================

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableWithoutFeedback, // 1. Impor TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router'; // 2. Impor useRouter
import { AuthContext } from '../../services/AuthContext';
import Colors from '../../constants/Colors';

const LoginScreen = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter(); // 3. Inisialisasi router

  const handleLogin = async () => {
    if (!usernameOrEmail || !password) {
      Alert.alert('Error', 'Username/Email dan password tidak boleh kosong.');
      return;
    }
    setIsLoading(true);
    const result = await login(usernameOrEmail, password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Login Gagal', result.error || 'Terjadi kesalahan saat login.');
    }
  };

  return (
    // 4. Bungkus semua dengan TouchableWithoutFeedback untuk menangkap sentuhan di latar
    <TouchableWithoutFeedback onPress={() => router.back()}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {/* 5. Bungkus sheet dengan Pressable agar sentuhan di dalam form tidak menutup modal */}
        <Pressable>
          <View style={styles.sheet}>
            <Text style={styles.greetingText}>Halo,</Text>
            <Text style={styles.title}>Selamat Datang Kembali!</Text>

            <TextInput
              style={styles.input}
              placeholder="Username atau Email"
              placeholderTextColor={Colors.light.textSecondary}
              value={usernameOrEmail}
              onChangeText={setUsernameOrEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.light.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable 
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? '#256528' : Colors.light.primary }
              ]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Masuk</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// ... (styles tetap sama)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  greetingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: Colors.light.text,
    marginBottom: 24,
  },
  input: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
    color: Colors.light.text,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default LoginScreen;
