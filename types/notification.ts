export interface Notification {
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

export interface NotificationIconConfig {
    name: string;
    color: string;
    bgColor: string;
}