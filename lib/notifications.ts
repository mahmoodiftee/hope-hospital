// notifications.ts - Simplified approach for EAS Build APK
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications to show when app is in foreground
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
        console.log('❌ Must use physical device for Push Notifications');
        return;
    }

    try {
        // 1. Request permissions
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

        console.log('✅ Notification permissions granted');

        // 2. Set up Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                sound: 'default',
                showBadge: true,
            });
            console.log('✅ Android notification channel created');
        }

        // 3. Get Expo Push Token
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId || '0a9be857-9039-4488-a49a-ea2a37259acb',
        });
        
        console.log('📱 Expo Push Token obtained:', tokenData.data.substring(0, 30) + '...');
        
        // For APK builds, also log FCM token if available
        if (Platform.OS === 'android' && Constants.executionEnvironment === null) {
            try {
                const fcmTokenData = await Notifications.getDevicePushTokenAsync();
                console.log('📱 FCM Token obtained:', fcmTokenData.data.substring(0, 30) + '...');
            } catch (error) {
                console.log('⚠️ FCM token not available, Native Notify will handle token conversion');
            }
        }
        
        return tokenData.data;

    } catch (error) {
        console.error('❌ Error setting up notifications:', error);
        return undefined;
    }
}

// Function to verify registration with Native Notify
export async function verifyNativeNotifyRegistration(userId?: string): Promise<any> {
    try {
        console.log('🔍 Verifying Native Notify registration...');
        const response = await fetch(`https://app.nativenotify.com/api/expo/indie/subs/${APP_ID}/${APP_TOKEN}`);
        const users = await response.json();

        console.log('📊 Total registered users:', users.length);

        if (userId) {
            const userRecord = users.find((user: any) => 
                user.subID === userId || user.sub_id === userId
            );
            
            if (userRecord) {
                console.log(`✅ User ${userId} found in Native Notify registry`);
                console.log('- Has Expo Token:', !!(userRecord.expoAndroidToken || userRecord.expo_android_token));
                console.log('- Has FCM Token:', !!(userRecord.firebaseToken || userRecord.android_fcm_token));
                console.log('- Platform:', userRecord.platform || 'unknown');
                return true;
            } else {
                console.log(`❌ User ${userId} NOT found in Native Notify registry`);
                console.log('💡 User needs to be registered with Native Notify');
                return false;
            }
        }

        // Log all users for debugging
        users.forEach((user: any, index: number) => {
            console.log(`👤 User ${index + 1}:`, {
                subID: user.subID || user.sub_id,
                hasExpoToken: !!(user.expoAndroidToken || user.expo_android_token),
                hasFCMToken: !!(user.firebaseToken || user.android_fcm_token),
                platform: user.platform || 'unknown'
            });
        });

    } catch (error) {
        console.error('❌ Failed to verify Native Notify registration:', error);
        return false;
    }
}

// Simple setup function
export async function setupBasicNotifications(): Promise<string | undefined> {
    console.log('🚀 Setting up basic notifications...');
    return await registerForPushNotificationsAsync();
}