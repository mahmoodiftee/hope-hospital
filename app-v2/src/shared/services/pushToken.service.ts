/**
 * Push token registration — single service, called in exactly two places:
 * 1. app/_layout.tsx on mount (for already-authenticated users)
 * 2. auth.store.ts setSession() (on every successful login)
 *
 * Nowhere else. This is the fix for the original bug where only
 * new-guest-first-booking users received push notifications.
 */
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

/**
 * Requests permission and returns the Expo push token string.
 * Returns null if on simulator or permission denied.
 */
export async function getExpoPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
        console.warn('[pushToken] Push notifications only work on physical devices.');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('[pushToken] Push notification permission denied.');
        return null;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#007AFF',
        });
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
}

/**
 * Registers a push token with the backend for a given user.
 * Safe to call multiple times — backend should upsert.
 */
export async function registerPushToken(userId: string): Promise<void> {
    try {
        const token = await getExpoPushToken();
        if (!token) return;

        await fetch(`${API_BASE_URL}/api/register-push-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, expoPushToken: token }),
        });
    } catch (error) {
        // Non-fatal — log but don't crash the app or fail the login
        console.warn('[pushToken] Failed to register push token:', error);
    }
}
