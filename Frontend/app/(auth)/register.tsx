// ===================================================================
// File: register.tsx
// Lokasi: Frontend/app/(auth)/register.tsx
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
import { useRouter } from 'expo-router';
import { AuthContext } from '../../services/AuthContext';
import Colors from '../../constants/Colors';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'Semua kolom tidak boleh kosong.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password minimal harus 8 karakter.');
      return;
    }

    setIsLoading(true);
    const result = await register(username, email, password);
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Sukses',
        'Pendaftaran berhasil! Silakan masuk.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Pendaftaran Gagal', result.error || 'Terjadi kesalahan saat mendaftar.');
    }
  };

  return (
    // 2. Bungkus semua dengan TouchableWithoutFeedback
    <TouchableWithoutFeedback onPress={() => router.back()}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {/* 3. Bungkus sheet dengan Pressable */}
        <Pressable>
          <View style={styles.sheet}>
            <Text style={styles.greetingText}>Halo,</Text>
            <Text style={styles.title}>Selamat Datang!</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.light.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={Colors.light.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min. 8 karakter)"
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
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Daftar</Text>
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

export default RegisterScreen;
