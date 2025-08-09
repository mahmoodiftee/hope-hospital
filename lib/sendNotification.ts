import axios from 'axios';
import { Platform } from 'react-native';

export const sendPushToUser = async ({
    userId,
    title,
    message,
    data = {},
}: {
    userId: string;
    title: string;
    message: string;
    data?: Record<string, any>;
}) => {

    try {
        const startTime = Date.now();
        const payload = {
            subID: userId,
            appId: 31591,
            appToken: "CFKdEHY835MXsOap4DerLI",
            title,
            message,
            ...(Object.keys(data).length > 0 && { data }),
        };

        const response = await axios.post(
            'https://app.nativenotify.com/api/indie/notification',
            payload,
            {
                timeout: 15000, // 15 second timeout
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`✅ Push notification sent to ${userId}: ${title}`);

        return {
            success: true,
            data: response.data,
            duration,
            status: response.status
        };

    } catch (error: any) {
        console.log('❌ Error sending push notification:', error.message);
        return {
            success: false,
            error: error.message,
            errorType: error.constructor.name,
            status: error.response?.status,
            details: error.response?.data
        };
    }
};

export const checkNativeNotifyStatus = async () => {

    try {
        const APP_ID = 31591;
        const APP_TOKEN = 'CFKdEHY835MXsOap4DerLI';

        const response = await axios.get(
            `https://app.nativenotify.com/api/expo/indie/subs/${APP_ID}/${APP_TOKEN}`,
            { timeout: 10000 }
        );
        return { success: true, users: response.data };
    } catch (error: any) {
        console.log('❌ Native Notify service check failed:', error.message);
        return { success: false, error: error.message };
    }
};

export const testDirectExpoPush = async (expoPushToken: string, title: string, body: string) => {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data: {
            test: true,
            timestamp: Date.now(),
            platform: Platform.OS
        },
        priority: 'high',
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error: any) {
        console.log('❌ Direct Expo push error:', error.message);
        return { success: false, error: error.message };
    }
};