// ===================================================================
// File: EnsiklopediaCard.tsx
// Lokasi: Frontend/components/EnsiklopediaCard.tsx
// Deskripsi: Komponen UI terpisah untuk menampilkan satu kartu penyakit
//            di halaman ensiklopedia.
// ===================================================================

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

// Mendefinisikan tipe data untuk props yang diterima oleh komponen ini
export type EnsiklopediaItem = {
  id: string;
  name: string;
  description: string;
  image: any; // Tipe 'any' untuk gambar dari require()
  tag: {
    text: string;
    color: string;
  };
};

type EnsiklopediaCardProps = {
  item: EnsiklopediaItem;
};

const EnsiklopediaCard = ({ item }: EnsiklopediaCardProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      // Navigasi ke halaman detail dengan membawa ID penyakit
      onPress={() => router.push(`/ensiklopedia/${item.id}` as any)}
    >
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.cardTextContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={[styles.tag, { backgroundColor: item.tag.color }]}>
            <Text style={styles.tagText}>{item.tag.text}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardTextContainer: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.light.text,
    flex: 1,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  cardDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
});

export default EnsiklopediaCard;
