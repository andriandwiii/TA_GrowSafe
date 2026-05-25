// ===================================================================
// File: EnsiklopediaCard.tsx
// Lokasi: Frontend/components/EnsiklopediaCard.tsx
// Deskripsi: Komponen UI terpisah untuk menampilkan satu kartu penyakit
//            di halaman ensiklopedia.
// ===================================================================

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
  index: number;
};

const EnsiklopediaCard = ({ item, index }: EnsiklopediaCardProps) => {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.delay(index * 150).springify()}>
      <TouchableOpacity 
        style={styles.cardContainer}
        activeOpacity={0.8}
        // Navigasi ke halaman detail dengan membawa ID penyakit
        onPress={() => router.push(`/ensiklopedia/${item.id}` as any)}
      >
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.cardImage} />
          <View style={[styles.tag, { backgroundColor: item.tag.color }]}>
            <Text style={styles.tagText}>{item.tag.text}</Text>
          </View>
        </View>
        <View style={styles.cardTextContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.readMoreText}>Baca selengkapnya</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  tag: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tagText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  },
  cardTextContainer: {
    padding: 20,
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
    color: '#1E293B',
    flex: 1,
  },
  cardDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 12,
  },
  readMoreText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: Colors.light.primary ?? '#2E7D32',
  },
});

export default EnsiklopediaCard;
