/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'CrossDuel',
  slug: 'crossduel',
  scheme: 'crossduel',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.crossduel.app',
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    edgeToEdgeEnabled: true,
    package: 'com.crossduel.app',
  },
  plugins: ['expo-router'],
  experiments: { typedRoutes: true },
  extra: { router: {} },
  autolinking: {
    exclude: [
      'expo-image',
      'expo-image-manipulator',
      'expo-image-picker',
      'expo-camera',
      'expo-video',
      'expo-av',
      'expo-notifications',
      'expo-location',
      'expo-media-library',
      'expo-contacts',
      'expo-calendar',
      'expo-sensors',
    ],
  },
};
