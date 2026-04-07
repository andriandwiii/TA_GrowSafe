// ===================================================================
// File: HeaderProfileButton.tsx
// Lokasi: Frontend/components/HeaderProfileButton.tsx
// Deskripsi: Diperbarui untuk menggunakan dropdown menu, bukan Alert.
// ===================================================================

import React, { useContext } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../services/AuthContext';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Colors from '../constants/Colors';

const HeaderProfileButton = () => {
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  return (
    <Menu>
      {/* Ini adalah elemen yang akan memicu menu (ikon profil) */}
      <MenuTrigger>
        <Ionicons 
          name="person-circle-outline" 
          size={32} 
          color="white" 
          style={styles.trigger} 
        />
      </MenuTrigger>
      
      {/* Ini adalah konten dari dropdown menu yang muncul */}
      <MenuOptions customStyles={menuOptionsStyles}>
        <MenuOption onSelect={() => router.push('/profile' as any)}>
          <Text style={styles.menuText}>Halaman Akun</Text>
        </MenuOption>
        <MenuOption onSelect={logout}>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

const styles = StyleSheet.create({
  trigger: {
    marginRight: 16,
  },
  menuText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.text,
  },
  logoutText: {
    color: Colors.light.error, // Warna merah untuk aksi logout
  },
});

const menuOptionsStyles = {
  optionsContainer: {
    borderRadius: 8,
    padding: 5,
    marginTop: 40, // Memberi jarak dari header
  },
};

export default HeaderProfileButton;
