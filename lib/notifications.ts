import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are displayed when received in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false, 
        shouldShowList: false,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (!Device.isDevice) {
        alert('Must use physical device for Push Notifications');
        return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Permission for notifications not granted');
        return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    // console.log('🔔 Expo Push Token:', token);

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
        });
    }

    return token;
}
