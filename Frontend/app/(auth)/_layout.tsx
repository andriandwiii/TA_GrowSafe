// ===================================================================
// File: _layout.tsx
// Lokasi: Frontend/app/(auth)/_layout.tsx
// ===================================================================

import React from 'react';
import { Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade_from_bottom' }} />
      <Stack.Screen name="register" options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade_from_bottom' }} />
    </Stack>
  );
};

export default AuthLayout;