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

const APP_ID = 31591;
const APP_TOKEN = 'CFKdEHY835MXsOap4DerLI';

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (!Device.isDevice) {
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

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId || '0a9be857-9039-4488-a49a-ea2a37259acb',
        });

        if (Platform.OS === 'android' && Constants.executionEnvironment === null) {
            try {
                const fcmTokenData = await Notifications.getDevicePushTokenAsync();
                console.log('📱 FCM Token obtained:', fcmTokenData.data.substring(0, 30) + '...');
            } catch (error) {
                console.log('⚠️ FCM token not available, Native Notify will handle token conversion', error);
            }
        }

        return tokenData.data;

    } catch (error) {
        console.error('❌ Error setting up notifications:', error);
        return undefined;
    }
}

export async function verifyNativeNotifyRegistration(userId?: string): Promise<any> {
    try {
        const response = await fetch(`https://app.nativenotify.com/api/expo/indie/subs/${APP_ID}/${APP_TOKEN}`);
        const users = await response.json();

        if (userId) {
            const userRecord = users.find((user: any) =>
                user.subID === userId || user.sub_id === userId
            );

            if (userRecord) {
                console.log(`✅ User ${userId} registered for notifications`);
                return true;
            } else {
                console.log(`❌ User ${userId} NOT found in Native Notify registry`);
                return false;
            }
        }

    } catch (error) {
        console.error('❌ Failed to verify Native Notify registration:', error);
        return false;
    }
}

export async function setupBasicNotifications(): Promise<string | undefined> {
    return await registerForPushNotificationsAsync();
}