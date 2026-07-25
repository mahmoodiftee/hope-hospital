import axios from 'axios';
import { Platform } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL

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
            userId,
            title,
            message,
            data: {
                ...data,
                timestamp: Date.now(),
                platform: Platform.OS,
            },
        };

        console.log(`📤 Sending push notification to user ${userId}: ${title}`);
        console.log('🔍 Debug Info:', {
            backendUrl: BACKEND_URL,
            fullEndpoint: `${BACKEND_URL}/api/send-notification`,
            payload
        });
        const response = await axios.post(
            `${BACKEND_URL}/api/send-notification`,
            payload,
            {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`✅ Push notification sent to ${userId} in ${duration}ms`);

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


export const checkPushNotificationStatus = async () => {
    try {
        const response = await axios.get(
            `${BACKEND_URL}/health`,
            { timeout: 10000 }
        );

        console.log('✅ Backend health check passed');
        return { success: true, data: response.data };
    } catch (error: any) {
        console.log('❌ Backend health check failed:', error.message);
        return { success: false, error: error.message };
    }
};

export const testDirectExpoPush = async (
    expoPushToken: string,
    title: string,
    body: string
) => {
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

        if (response.ok) {
            console.log('✅ Direct Expo push successful');
        } else {
            console.log('❌ Direct Expo push failed:', data);
        }

        return { success: response.ok, data };
    } catch (error: any) {
        console.log('❌ Direct Expo push error:', error.message);
        return { success: false, error: error.message };
    }
};