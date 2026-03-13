/**
 * Push notification sending service.
 * Sends push notifications via the backend API.
 */
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * Sends a push notification to a user via the backend.
 * Non-blocking — failures are swallowed so they never break the booking flow.
 */
export async function sendPushToUser({
    userId,
    title,
    message,
    data = {},
}: {
    userId: string;
    title: string;
    message: string;
    data?: Record<string, any>;
}): Promise<{ success: boolean }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/send-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                title,
                message,
                data: {
                    ...data,
                    timestamp: Date.now(),
                    platform: Platform.OS,
                },
            }),
        });

        return { success: response.ok };
    } catch (error: any) {
        console.warn('[sendPushToUser] Failed (non-blocking):', error.message);
        return { success: false };
    }
}
