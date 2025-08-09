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
    console.log('🚀 [DEBUG] Starting sendPushToUser function');
    console.log('📊 [DEBUG] Input parameters:', {
        userId,
        title,
        message,
        data,
        platform: Platform.OS,
        isDev: __DEV__,
    });

    try {
        const startTime = Date.now();

        // Prepare the payload
        const payload = {
            subID: userId,
            appId: 31591,
            appToken: "CFKdEHY835MXsOap4DerLI",
            title,
            message,
            ...(Object.keys(data).length > 0 && { data }),
        };

        console.log('📤 [DEBUG] Prepared payload:', JSON.stringify(payload, null, 2));
        console.log('🌐 [DEBUG] API Endpoint: https://app.nativenotify.com/api/indie/notification');

        // Make the request with detailed logging
        console.log('⏱️ [DEBUG] Making HTTP request...');

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

        console.log('✅ [DEBUG] HTTP request successful');
        console.log('⏱️ [DEBUG] Request duration:', `${duration}ms`);
        console.log('📨 [DEBUG] Response status:', response.status);
        console.log('📨 [DEBUG] Response headers:', JSON.stringify(response.headers, null, 2));
        console.log('📨 [DEBUG] Response data:', JSON.stringify(response.data, null, 2));

        // Log success message
        console.log(`✅ Push notification sent successfully to ${userId}`);
        console.log(`📄 Title: "${title}"`);
        console.log(`💬 Message: "${message}"`);

        return {
            success: true,
            data: response.data,
            duration,
            status: response.status
        };

    } catch (error: any) {
        console.log('❌ [DEBUG] Error occurred in sendPushToUser');
        console.log('🔍 [DEBUG] Error type:', error.constructor.name);
        console.log('💥 [DEBUG] Error message:', error.message);

        if (error.response) {
            // Server responded with error status
            console.log('🌐 [DEBUG] Server Error Response:');
            console.log('📊 Status:', error.response.status);
            console.log('📊 Status Text:', error.response.statusText);
            console.log('📄 Headers:', JSON.stringify(error.response.headers, null, 2));
            console.log('📄 Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            // Network error or no response
            console.log('🌐 [DEBUG] Network Error:');
            console.log('📡 Request made but no response received');
            console.log('🔗 Request details:', error.request);
        } else {
            // Error in setting up the request
            console.log('⚙️ [DEBUG] Request Setup Error:', error.message);
        }

        if (error.code) {
            console.log('🏷️ [DEBUG] Error Code:', error.code);
        }

        if (error.config) {
            console.log('⚙️ [DEBUG] Request Config:');
            console.log('🔗 URL:', error.config.url);
            console.log('📊 Method:', error.config.method);
            console.log('⏱️ Timeout:', error.config.timeout);
        }

        return {
            success: false,
            error: error.message,
            errorType: error.constructor.name,
            status: error.response?.status,
            details: error.response?.data
        };
    }
};

// Additional debug function to check Native Notify service status
export const checkNativeNotifyStatus = async () => {
    console.log('🔍 [DEBUG] Checking Native Notify service status...');

    try {
        const APP_ID = 31591;
        const APP_TOKEN = 'CFKdEHY835MXsOap4DerLI';

        const response = await axios.get(
            `https://app.nativenotify.com/api/expo/indie/subs/${APP_ID}/${APP_TOKEN}`,
            { timeout: 10000 }
        );

        console.log('✅ [DEBUG] Native Notify service is accessible');
        console.log('📊 [DEBUG] Registered users:', response.data.length);

        return { success: true, users: response.data };
    } catch (error: any) {
        console.log('❌ [DEBUG] Native Notify service check failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Test function for direct Expo push service
export const testDirectExpoPush = async (expoPushToken: string, title: string, body: string) => {
    console.log('🎯 [DEBUG] Testing direct Expo push service...');

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

    console.log('📤 [DEBUG] Direct Expo message payload:', JSON.stringify(message, null, 2));

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

        console.log('📨 [DEBUG] Direct Expo response status:', response.status);

        const data = await response.json();
        console.log('📨 [DEBUG] Direct Expo response data:', JSON.stringify(data, null, 2));

        return { success: response.ok, data };
    } catch (error: any) {
        console.log('❌ [DEBUG] Direct Expo push error:', error.message);
        return { success: false, error: error.message };
    }
};