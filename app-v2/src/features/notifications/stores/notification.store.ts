import { create } from 'zustand';
import { Notification } from '@/shared/types';
import { NotificationService } from '../services/notification.service';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    offset: number;
    error: string | null;

    // Actions
    fetchNotifications: (userId: string, isRefresh?: boolean) => Promise<void>;
    loadMoreNotifications: (userId: string) => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    refreshUnreadCount: (userId: string) => Promise<void>;
    clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    offset: 0,
    error: null,

    fetchNotifications: async (userId, isRefresh = false) => {
        if (isRefresh) {
            set({ isLoading: true, error: null, offset: 0, hasMore: true });
        } else {
            set({ isLoading: true, error: null });
        }

        try {
            const limit = 20;
            const notifications = await NotificationService.getNotifications(userId, limit, 0);

            // Also fetch the global unread count from the backend to be accurate
            const unreadCount = await NotificationService.getUnreadCount(userId);

            set({
                notifications,
                unreadCount,
                isLoading: false,
                offset: notifications.length,
                hasMore: notifications.length === limit
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    loadMoreNotifications: async (userId) => {
        const { notifications, offset, hasMore, isLoadingMore } = get();

        if (!hasMore || isLoadingMore) return;

        set({ isLoadingMore: true });
        try {
            const limit = 20;
            const newNotifications = await NotificationService.getNotifications(userId, limit, offset);

            set({
                notifications: [...notifications, ...newNotifications],
                offset: offset + newNotifications.length,
                hasMore: newNotifications.length === limit,
                isLoadingMore: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoadingMore: false });
        }
    },

    markAsRead: async (notificationId) => {
        const { notifications, unreadCount } = get();

        // Optimistic update
        const updatedNotifications = notifications.map(n =>
            n.$id === notificationId ? { ...n, isRead: true } : n
        );

        set({
            notifications: updatedNotifications,
            unreadCount: Math.max(0, unreadCount - 1)
        });

        try {
            await NotificationService.markAsRead(notificationId);
        } catch (error: any) {
            // Rollback not strictly necessary here but good practice
            console.warn('[NotificationStore] Failed to mark as read in backend:', error);
        }
    },

    refreshUnreadCount: async (userId) => {
        try {
            const count = await NotificationService.getUnreadCount(userId);
            set({ unreadCount: count });
        } catch (error) {
            console.error('[NotificationStore] Failed to refresh unread count:', error);
        }
    },

    clearError: () => set({ error: null }),
}));

