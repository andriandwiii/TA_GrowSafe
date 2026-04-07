// ===================================================================
// File: [name].tsx
// Lokasi: Frontend/app/ensiklopedia/[name].tsx
// Deskripsi: Halaman detail untuk satu penyakit di ensiklopedia.
// ===================================================================
import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export function EncyclopediaDetailScreen() {
  const { name } = useLocalSearchParams(); // Mengambil nama dari URL
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Halaman Detail untuk Penyakit: {name}</Text>
    </View>
  );
}