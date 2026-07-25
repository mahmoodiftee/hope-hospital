import 'react-native-url-polyfill/auto';
import { useFonts } from 'expo-font';
import { SplashScreen as ExpoSplashScreen, Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { useAuth } from '@/features/auth';
import '@/globals.css';
import '../src/i18n';

ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, error] = useFonts({
        'Quicksand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
        'Quicksand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
        'Quicksand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
        'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
        'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    });

    const { initializeAuth } = useAuth();

    useEffect(() => {
        SystemUI.setBackgroundColorAsync('#ffffff');
        if (fontsLoaded || error) {
            ExpoSplashScreen.hideAsync();
        }

        // ARCH RULE: Initialize auth and push token on app boot
        initializeAuth();
    }, [fontsLoaded, error, initializeAuth]);

    if (!fontsLoaded && !error) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="appointments/index" />
                    <Stack.Screen name="notifications/index" />
                    <Stack.Screen name="prescriptions/index" />
                    <Stack.Screen name="gallery/index" />
                </Stack>
                {/* Single global Toaster — do NOT add this inside any other component */}
                <Toaster />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
