// ===================================================================
// File: _layout.tsx
// Lokasi: Frontend/app/(tabs)/_layout.tsx
// Deskripsi: Diperbarui untuk menangani tombol pindai kamera dengan benar.
// ===================================================================

import React from 'react';
import { Tabs, useRouter } from 'expo-router'; // 1. Impor useRouter
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import HeaderProfileButton from '../../components/HeaderProfileButton';

const TabsLayout = () => {
  const router = useRouter(); // 2. Inisialisasi router

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTitleStyle: {
          color: 'white',
          fontFamily: 'Poppins-Bold',
        },
        headerRight: () => <HeaderProfileButton />,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Regular',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Riwayat Pindai',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 3. Perbaikan pada layar Pindai Kamera */}
      <Tabs.Screen
        // Nama ini hanya sebagai placeholder di tab bar, tidak menavigasi ke file
        name="pindaiPlaceholder" 
        options={{
          title: '', // Kosongkan judul
          tabBarIcon: () => (
            <View style={styles.scanButtonContainer}>
              <Ionicons name="camera" size={32} color="white" />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Mencegah navigasi default
            e.preventDefault();
            // Menjalankan navigasi manual ke layar modal
            router.push('/pindaiKamera'); 
          },
        }}
      />

      <Tabs.Screen
        name="ensiklopedia"
        options={{
          title: 'Ensiklopedia',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  scanButtonContainer: {
    backgroundColor: Colors.light.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default TabsLayout;
