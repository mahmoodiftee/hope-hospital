const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// ARCH RULE: Explicitly resolve Reanimated and Worklets on Windows to avoid Metro confusion
config.resolver.extraNodeModules = {
    'react-native-reanimated': require.resolve('react-native-reanimated/package.json').replace(/[\\/]package\.json$/, ''),
    'react-native-worklets': require.resolve('react-native-worklets/package.json').replace(/[\\/]package\.json$/, ''),
};

// Force tslib CJS — framer-motion (via moti) hits tslib/modules which breaks under Metro
const tslibCjs = path.resolve(__dirname, 'node_modules/tslib/tslib.js');
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (
        moduleName === 'tslib' ||
        moduleName === 'tslib/modules/index.js' ||
        moduleName === 'tslib/modules/index' ||
        moduleName.startsWith('tslib/modules/')
    ) {
        return { filePath: tslibCjs, type: 'sourceFile' };
    }
    if (defaultResolveRequest) {
        return defaultResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/globals.css' });
