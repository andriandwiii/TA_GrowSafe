import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../services/AuthContext';
import Colors from '../../constants/Colors';

const TabsLayout = () => {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const userInitial = user?.nama ? user.nama.charAt(0).toUpperCase() : 'U';

  const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;
  const tabHeight = 65 + (insets.bottom > 0 ? insets.bottom - 10 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Disembunyikan karena kita sudah membuat header custom yang lebih bagus di setiap screen
        tabBarActiveTintColor: Colors.light.primary ?? '#2E7D32',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#FFFFFF',
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#94A3B8',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      {/* 1. Tab Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 2. Tab Riwayat */}
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 3. Tombol Kamera Tengah */}
      <Tabs.Screen
        name="pindaiPlaceholder"
        options={{
          title: '',
          tabBarButton: (props) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                top: insets.bottom > 0 ? -32 : -24,
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}
              onPress={() => {
                router.push('/pindaiKamera' as any);
              }}
            >
              <View style={styles.scanButtonContainer}>
                <View style={styles.scanButtonInner}>
                  <Ionicons name="scan-outline" size={28} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* 4. Tab Ensiklopedia */}
      <Tabs.Screen
        name="ensiklopedia"
        options={{
          title: 'Edukasi',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 5. Tab Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.profileIconContainer, focused && styles.profileIconFocused]}>
              <Text style={[styles.profileInitial, { color: focused ? Colors.light.primary ?? '#2E7D32' : '#94A3B8' }]}>
                {userInitial}
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  scanButtonContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary ?? '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.light.primary ?? '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileIconFocused: {
    borderColor: Colors.light.primary ?? '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  profileInitial: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  }
});

export default TabsLayout;