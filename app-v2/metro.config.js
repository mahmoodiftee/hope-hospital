const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// ARCH RULE: Explicitly resolve Reanimated and Worklets on Windows to avoid Metro confusion
config.resolver.extraNodeModules = {
    'react-native-reanimated': require.resolve('react-native-reanimated/package.json').replace(/[\\/]package\.json$/, ''),
    'react-native-worklets': require.resolve('react-native-worklets/package.json').replace(/[\\/]package\.json$/, ''),
};

module.exports = withNativeWind(config, { input: './src/globals.css' });
