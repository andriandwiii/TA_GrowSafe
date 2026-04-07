// ===================================================================
// File: svg.d.ts (atau nama lain dengan ekstensi .d.ts)
// Lokasi: Frontend/svg.d.ts (di folder root Frontend)
// Deskripsi: File ini mendeklarasikan tipe untuk semua file .svg
//            agar bisa diimpor sebagai komponen React di TypeScript.
// ===================================================================

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}