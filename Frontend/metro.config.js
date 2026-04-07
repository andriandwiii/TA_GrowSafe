// ===================================================================
// File: metro.config.js
// Lokasi: Frontend/metro.config.js
// Deskripsi: File konfigurasi untuk Metro Bundler.
//            Ini memberitahu Metro cara menangani file .svg.
// ===================================================================

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
