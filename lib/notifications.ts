import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (!Device.isDevice) {
        console.log('⚠️ Must use physical device for push notifications');
        return;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('❌ Notification permissions not granted');
            return;
        }

        // Set up Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                sound: 'default',
                showBadge: true,
            });
        }

        const projectId =
            Constants.easConfig?.projectId ??
            Constants.expoConfig?.extra?.eas?.projectId ?? process.env.EXPO_PROJECT_ID;

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        console.log('✅ Expo Push Token obtained:', tokenData.data.substring(0, 30) + '...');

        return tokenData.data;

    } catch (error) {
        console.error('❌ Error setting up notifications:', error);
        return undefined;
    }
}

// Register push token with your backend
export async function registerPushTokenWithBackend(
    userId: string,
    expoPushToken: string,
    backendUrl: string = process.env.EXPO_PUBLIC_API_BASE_URL
): Promise<boolean> {
    try {
        const response = await fetch(`${backendUrl}/api/register-push-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                expoPushToken,
                platform: Platform.OS,
            }),
        });

        const data = await response.json();

        if (data.success) {
            console.log(`✅ Push token registered for user ${userId}`);
            return true;
        } else {
            console.log(`❌ Failed to register push token: ${data.message}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error registering push token:', error);
        return false;
    }
}

// Verify token is registered on backend
export async function verifyPushTokenRegistration(
    userId: string,
    backendUrl: string = process.env.EXPO_PUBLIC_API_BASE_URL
): Promise<boolean> {
    try {
        const response = await fetch(`${backendUrl}/api/verify-push-token/${userId}`);
        const data = await response.json();

        if (data.success && data.registered) {
            console.log(`✅ User ${userId} has registered push token`);
            return true;
        } else {
            console.log(`❌ User ${userId} NOT registered for push notifications`);
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to verify push token registration:', error);
        return false;
    }
}

export async function setupBasicNotifications(): Promise<string | undefined> {
    return await registerForPushNotificationsAsync();
}