import 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { useFonts } from 'expo-font';
import { SplashScreen as ExpoSplashScreen, Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { useAuth } from '@/features/auth';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { TOAST_RECLAIM_EVENT } from '@/shared/utils/toastReclaim';
import { applyOtaUpdateIfAvailable } from '@/shared/services/otaUpdate.service';
import '@/globals.css';
import '../src/i18n';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
    const [fontsLoaded, error] = useFonts({
        'Quicksand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
        'Quicksand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
        'Quicksand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
        'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
        'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    });
    const [toasterKey, setToasterKey] = useState(0);

    const { initializeAuth } = useAuth();

    useEffect(() => {
        SystemUI.setBackgroundColorAsync('#ffffff').catch(() => {});
        if (fontsLoaded || error) {
            ExpoSplashScreen.hideAsync().catch(() => {});
        }
    }, [fontsLoaded, error]);

    useEffect(() => {
        // Defer auth boot so a SecureStore/network failure cannot kill first paint
        const id = setTimeout(() => {
            initializeAuth().catch((err) => {
                console.warn('[RootLayout] initializeAuth failed:', err);
            });
        }, 0);
        return () => clearTimeout(id);
    }, [initializeAuth]);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener(TOAST_RECLAIM_EVENT, () => {
            setToasterKey((k) => k + 1);
        });
        return () => sub.remove();
    }, []);

    useEffect(() => {
        applyOtaUpdateIfAvailable().catch(() => {});
    }, []);

    if (!fontsLoaded && !error) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ErrorBoundary>
                    <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="appointments/index" />
                        <Stack.Screen name="notifications/index" />
                        <Stack.Screen name="prescriptions/index" />
                        <Stack.Screen name="gallery/index" />
                    </Stack>
                    <Toaster key={toasterKey} />
                </ErrorBoundary>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
