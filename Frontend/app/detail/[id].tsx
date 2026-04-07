// ===================================================================
// File: [id].tsx
// Lokasi: Frontend/app/detail/[id].tsx
// Deskripsi: Halaman detail untuk satu riwayat pemindaian.
// ===================================================================
import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams(); // Mengambil ID dari URL
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Halaman Detail untuk Riwayat ID: {id}</Text>
    </View>
  );
}