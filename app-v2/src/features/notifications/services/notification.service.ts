import { Query } from 'react-native-appwrite';
import { databases, config } from '@/config/appwrite.config';
import { Notification } from '@/shared/types';

export class NotificationService {
    /**
     * Fetches notifications for a user based on their userId.
     */
    static async getNotifications(userId: string, limit = 50, offset = 0): Promise<Notification[]> {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                config.notificationsCollectionId,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            return response.documents as unknown as Notification[];
        } catch (error: any) {
            console.error('[NotificationService] getNotifications error:', error);
            throw new Error(error.message || 'Failed to fetch notifications');
        }
    }

    /**
     * Marks a notification as read.
     */
    static async markAsRead(notificationId: string): Promise<void> {
        try {
            await databases.updateDocument(
                config.databaseId,
                config.notificationsCollectionId,
                notificationId,
                { isRead: true }
            );
        } catch (error: any) {
            console.error('[NotificationService] markAsRead error:', error);
            throw new Error(error.message || 'Failed to mark notification as read');
        }
    }

    /**
     * Fetches the count of unread notifications.
     */
    static async getUnreadCount(userId: string): Promise<number> {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                config.notificationsCollectionId,
                [
                    Query.equal('userId', userId),
                    Query.equal('isRead', false)
                ]
            );

            return response.total;
        } catch (error: any) {
            console.error('[NotificationService] getUnreadCount error:', error);
            return 0;
        }
    }
}

