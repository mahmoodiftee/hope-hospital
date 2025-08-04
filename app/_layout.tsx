import React, { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen as ExpoSplashScreen, Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { Toaster } from 'sonner-native';
import { StatusBar } from 'expo-status-bar';

import './globals.css';

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "QuickSand-Bold": require('../assets/fonts/Quicksand-Bold.ttf'),
    "QuickSand-Medium": require('../assets/fonts/Quicksand-Medium.ttf'),
    "QuickSand-Regular": require('../assets/fonts/Quicksand-Regular.ttf'),
    "QuickSand-SemiBold": require('../assets/fonts/Quicksand-SemiBold.ttf'),
    "QuickSand-Light": require('../assets/fonts/Quicksand-Light.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) ExpoSplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#f9fafb" />

      <Stack screenOptions={{ headerShown: false }} />

      <Toaster
        position="top-center"
        duration={3000}
        swipeToDismissDirection="up"
        richColors={true}
        closeButton={true}
        toastOptions={{
          style: {
            zIndex: 10000,
          },
        }}
      />
    </GestureHandlerRootView>
  );
}
