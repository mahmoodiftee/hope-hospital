import { NotificationIconConfig } from "@/types/notification";

export const getNotificationIcon = (type: string): NotificationIconConfig => {
    const configs: Record<string, NotificationIconConfig> = {
        appointment_confirmation: { name: 'calendar-outline', color: '#10B981', bgColor: '#ECFDF5' },
        appointment_reminder: { name: 'time-outline', color: '#3B82F6', bgColor: '#EFF6FF' },
        appointment_reschedule: { name: 'swap-horizontal-outline', color: '#F59E0B', bgColor: '#FFFBEB' },
        appointment_cancelled: { name: 'close-circle-outline', color: '#EF4444', bgColor: '#FEF2F2' },
        general: { name: 'notifications-outline', color: '#111827', bgColor: '#F9FAFB' },
    };
    return configs[type] || { name: 'notifications-outline', color: '#6B7280', bgColor: '#F9FAFB' };
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
};

export const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const parseMetadata = (metadata?: string) => {
    if (!metadata) return null;
    try {
        return JSON.parse(metadata);
    } catch {
        return null;
    }
};