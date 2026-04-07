// ===================================================================
// File: HistoryCard.tsx
// Lokasi: Frontend/components/HistoryCard.tsx
// Deskripsi: Komponen UI terpisah untuk menampilkan satu kartu riwayat.
// ===================================================================

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../services/api';
import Colors from '../constants/Colors';

// Mendefinisikan tipe data untuk props yang diterima oleh komponen ini
type HistoryItem = {
  id_riwayat: number;
  hasil_diagnosis: string;
  skor_keyakinan: number;
  tanggal_pindai: string;
  gambar_pindai: string;
};

type HistoryCardProps = {
  item: HistoryItem;
};

const HistoryCard = ({ item }: HistoryCardProps) => {
  const router = useRouter();
  const accuracy = (item.skor_keyakinan * 100).toFixed(0);
  const date = new Date(item.tanggal_pindai).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric', // Sesuai desain
  });

  const getTagInfo = (disease: string) => {
    const lowerCaseDisease = disease.toLowerCase();
    if (lowerCaseDisease.includes('phytophthora') || lowerCaseDisease.includes('antraknosa')) {
      return { text: 'Bahaya', color: Colors.light.error };
    }
    if (lowerCaseDisease.includes('red rust') || lowerCaseDisease.includes('scab')) {
      return { text: 'Waspada', color: Colors.light.warning };
    }
    return { text: 'Info', color: Colors.light.primary };
  };

  const tagInfo = getTagInfo(item.hasil_diagnosis);

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => router.push(`/detail/${item.id_riwayat}` as any)}
    >
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.hasil_diagnosis}</Text>
        <View style={styles.cardInfoContainer}>
          <View style={[styles.tag, { backgroundColor: tagInfo.color }]}>
            <Text style={styles.tagText}>{tagInfo.text}</Text> 
          </View>
          <Text style={styles.cardInfoText}>• Akurasi: {accuracy}%</Text>
        </View>
        <Text style={styles.cardDate}>{date}</Text>
      </View>
      <Image 
        source={{ uri: `${apiClient.defaults.baseURL}/${item.gambar_pindai}` }} 
        style={styles.cardImage} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: Colors.light.text,
  },
  cardInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  tagText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
  },
  cardInfoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  cardDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
  },
});

export default HistoryCard;
