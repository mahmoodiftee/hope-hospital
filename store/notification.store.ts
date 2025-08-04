import {
    deleteNotification,
    getUnreadNotificationsCount,
    getUserNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from '@/lib/appwrite';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Notification {
    $id: string;
    $createdAt: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    appointmentId?: string;
    scheduledAt: string;
    isPushed: boolean;
    priority: number;
    metadata?: string;
}

interface NotificationState {
    // State
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    refreshing: boolean;
    lastFetchTime: number | null;

    // Actions
    setNotifications: (notifications: Notification[]) => void;
    setUnreadCount: (count: number) => void;
    setLoading: (loading: boolean) => void;
    setRefreshing: (refreshing: boolean) => void;

    // API Actions
    fetchNotifications: (userId: string, limit?: number, offset?: number) => Promise<void>;
    fetchUnreadCount: (userId: string) => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: (userId: string) => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    deleteAllNotifications: (userId: string) => Promise<void>;

    // Utility Actions
    addNotification: (notification: Notification) => void;
    updateNotification: (notificationId: string, updates: Partial<Notification>) => void;
    incrementUnreadCount: () => void;
    decrementUnreadCount: () => void;
    resetNotifications: () => void;
}

const useNotificationStore = create<NotificationState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial State
                notifications: [],
                unreadCount: 0,
                loading: false,
                refreshing: false,
                lastFetchTime: null,

                // Basic Setters
                setNotifications: (notifications) =>
                    set({ notifications }, false, 'setNotifications'),

                setUnreadCount: (count) =>
                    set({ unreadCount: Math.max(0, count) }, false, 'setUnreadCount'),

                setLoading: (loading) =>
                    set({ loading }, false, 'setLoading'),

                setRefreshing: (refreshing) =>
                    set({ refreshing }, false, 'setRefreshing'),

                // API Actions
                fetchNotifications: async (userId: string, limit = 50, offset = 0) => {
                    try {
                        set({ loading: true }, false, 'fetchNotifications:start');

                        const response = await getUserNotifications(userId, limit, offset);
                        const notifications = response.documents as any[];

                        set({
                            notifications,
                            loading: false,
                            lastFetchTime: Date.now()
                        }, false, 'fetchNotifications:success');

                        // Also fetch unread count
                        get().fetchUnreadCount(userId);

                    } catch (error) {
                        console.error('Error fetching notifications:', error);
                        set({ loading: false }, false, 'fetchNotifications:error');
                        throw error;
                    }
                },

                fetchUnreadCount: async (userId: string) => {
                    try {
                        const count = await getUnreadNotificationsCount(userId);
                        set({ unreadCount: count }, false, 'fetchUnreadCount');
                    } catch (error) {
                        console.error('Error fetching unread count:', error);
                        throw error;
                    }
                },

                markAsRead: async (notificationId: string) => {
                    try {
                        await markNotificationAsRead(notificationId);

                        const { notifications, unreadCount } = get();
                        const notification = notifications.find(n => n.$id === notificationId);

                        // Update local state
                        const updatedNotifications = notifications.map(n =>
                            n.$id === notificationId ? { ...n, isRead: true } : n
                        );

                        const newUnreadCount = notification && !notification.isRead
                            ? Math.max(0, unreadCount - 1)
                            : unreadCount;

                        set({
                            notifications: updatedNotifications,
                            unreadCount: newUnreadCount
                        }, false, 'markAsRead');

                    } catch (error) {
                        console.error('Error marking notification as read:', error);
                        throw error;
                    }
                },

                markAllAsRead: async (userId: string) => {
                    try {
                        await markAllNotificationsAsRead(userId);

                        const { notifications } = get();
                        const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));

                        set({
                            notifications: updatedNotifications,
                            unreadCount: 0
                        }, false, 'markAllAsRead');

                    } catch (error) {
                        console.error('Error marking all notifications as read:', error);
                        throw error;
                    }
                },

                deleteNotification: async (notificationId: string) => {
                    try {
                        await deleteNotification(notificationId);

                        const { notifications, unreadCount } = get();
                        const deletedNotification = notifications.find(n => n.$id === notificationId);

                        const updatedNotifications = notifications.filter(n => n.$id !== notificationId);
                        const newUnreadCount = deletedNotification && !deletedNotification.isRead
                            ? Math.max(0, unreadCount - 1)
                            : unreadCount;

                        set({
                            notifications: updatedNotifications,
                            unreadCount: newUnreadCount
                        }, false, 'deleteNotification');

                    } catch (error) {
                        console.error('Error deleting notification:', error);
                        throw error;
                    }
                },

                deleteAllNotifications: async (userId: string) => {
                    try {
                        const { notifications } = get();

                        // Delete all notifications
                        const deletePromises = notifications.map(notification =>
                            deleteNotification(notification.$id)
                        );
                        await Promise.all(deletePromises);

                        set({
                            notifications: [],
                            unreadCount: 0
                        }, false, 'deleteAllNotifications');

                    } catch (error) {
                        console.error('Error deleting all notifications:', error);
                        throw error;
                    }
                },

                // Utility Actions
                addNotification: (notification: Notification) => {
                    const { notifications, unreadCount } = get();
                    const updatedNotifications = [notification, ...notifications];
                    const newUnreadCount = !notification.isRead ? unreadCount + 1 : unreadCount;

                    set({
                        notifications: updatedNotifications,
                        unreadCount: newUnreadCount
                    }, false, 'addNotification');
                },

                updateNotification: (notificationId: string, updates: Partial<Notification>) => {
                    const { notifications } = get();
                    const updatedNotifications = notifications.map(n =>
                        n.$id === notificationId ? { ...n, ...updates } : n
                    );

                    set({ notifications: updatedNotifications }, false, 'updateNotification');
                },

                incrementUnreadCount: () => {
                    const { unreadCount } = get();
                    set({ unreadCount: unreadCount + 1 }, false, 'incrementUnreadCount');
                },

                decrementUnreadCount: () => {
                    const { unreadCount } = get();
                    set({ unreadCount: Math.max(0, unreadCount - 1) }, false, 'decrementUnreadCount');
                },

                resetNotifications: () => {
                    set({
                        notifications: [],
                        unreadCount: 0,
                        loading: false,
                        refreshing: false,
                        lastFetchTime: null
                    }, false, 'resetNotifications');
                },
            }),
            {
                name: 'notification-store',
                // Only persist certain fields
                partialize: (state) => ({
                    unreadCount: state.unreadCount,
                    lastFetchTime: state.lastFetchTime,
                }),
            }
        ),
        {
            name: 'notification-store',
        }
    )
);

export default useNotificationStore;