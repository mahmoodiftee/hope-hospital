import { Notification } from '@/types/notification';
import { formatDate, getNotificationIcon } from '@/utils/notificationUtils';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import NotificationActions from './NotificationActions';
import NotificationBadge from './NotificationBadge';
import NotificationIcon from './NotificationIcon';

interface NotificationItemProps {
    notification: Notification;
    onPress: (notification: Notification) => void;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onPress,
    onMarkAsRead,
    onDelete
}) => {
    const iconConfig = getNotificationIcon(notification.type);

    const handleMarkAsRead = (e: any) => {
        e.stopPropagation();
        onMarkAsRead(notification.$id);
    };

    const handleDelete = (e: any) => {
        e.stopPropagation();
        onDelete(notification.$id);
    };

    return (
        <View className="">
            <TouchableOpacity
                onPress={() => onPress(notification)}
                activeOpacity={0.98}
                className="group"
            >
                <View className="bg-white rounded-2xl mb-2 shadow-lg">
                    {!notification.isRead && (
                        <View className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                    )}

                    <View className="p-2 px-3">
                        <View className="flex-row items-start gap-4">
                            <NotificationIcon
                                iconConfig={iconConfig}
                                showUnreadDot={!notification.isRead}
                            />

                            <View className="flex-1">
                                <View className="flex-row items-start justify-between mb-1">
                                    <Text className="font-semibold text-gray-900 text-base pr-2 leading-none w-2/3">
                                        {notification.title}
                                    </Text>
                                    <Text className="text-xs text-gray-400 mt-0.5 leading-none">
                                        {formatDate(notification.$createdAt)}
                                    </Text>
                                </View>

                                <Text
                                    className="text-gray-600 text-sm leading-5 mb-3"
                                    numberOfLines={3}
                                >
                                    {notification.message}
                                </Text>

                                <View className="flex-row items-center justify-between">
                                    <NotificationBadge
                                        type={notification.type}
                                        iconConfig={iconConfig}
                                    />
                                    <NotificationActions
                                        isRead={notification.isRead}
                                        //@ts-ignore
                                        onMarkAsRead={handleMarkAsRead}
                                        //@ts-ignore
                                        onDelete={handleDelete}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default NotificationItem;