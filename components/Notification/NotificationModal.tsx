import { Notification } from '@/types/notification';
import { formatFullDate, getNotificationIcon, parseMetadata } from '@/utils/notificationUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Modal, Text, TouchableOpacity, View } from 'react-native';
import NotificationBadge from './NotificationBadge';
import NotificationIcon from './NotificationIcon';

interface NotificationModalProps {
    notification: Notification | null;
    visible: boolean;
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    modalScale: Animated.Value;
    modalOpacity: Animated.Value;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    notification,
    visible,
    onClose,
    onMarkAsRead,
    onDelete,
    modalScale,
    modalOpacity
}) => {
    if (!notification) return null;

    const iconConfig = getNotificationIcon(notification.type);
    const metadata = parseMetadata(notification.metadata);

    const handleMarkAsRead = () => {
        onMarkAsRead(notification.$id);
        onClose();
    };

    const handleDelete = () => {
        onClose();
        setTimeout(() => onDelete(notification.$id), 300);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-5">
                <Animated.View
                    style={{
                        transform: [{ scale: modalScale }],
                        opacity: modalOpacity,
                    }}
                    className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                            <NotificationIcon iconConfig={iconConfig} size={24} />
                            <Text className="text-xl font-bold text-gray-900 ml-3">
                                Notification Details
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="p-2 bg-gray-50 rounded-full"
                        >
                            <Ionicons name="close" size={20} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View className="mb-6">
                        <Text className="text-2xl font-bold text-gray-900 mb-3">
                            {notification.title}
                        </Text>

                        <Text className="text-base text-gray-700 leading-6 mb-4">
                            {notification.message}
                        </Text>

                        {/* Status Badges */}
                        <View className="flex-row items-center mb-4 gap-3">
                            <View className={`px-3 py-1 rounded-full ${notification.isRead ? 'bg-[#ECFDF5]' : 'bg-[#EFF6FF]'}`}>
                                <Text className={`text-xs font-semibold ${notification.isRead ? 'text-[#10B981]' : 'text-[#3B82F6]'}`}>
                                    {notification.isRead ? 'Read' : 'Unread'}
                                </Text>
                            </View>
                            <NotificationBadge type={notification.type} iconConfig={iconConfig} />
                        </View>

                        {/* Metadata */}
                        {metadata && (
                            <View className="bg-gray-50 p-4 rounded-xl mb-4">
                                <Text className="text-sm font-semibold text-gray-900 mb-2">
                                    Additional Details:
                                </Text>
                                {Object.entries(metadata).map(([key, value]) => (
                                    <View key={key} className="flex-row justify-between py-1">
                                        <Text className="text-sm text-gray-600 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                        </Text>
                                        <Text className="text-sm text-gray-900 font-medium">
                                            {String(value)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Timestamps */}
                        <View className="bg-gray-50 p-4 rounded-xl">
                            <Text className="text-sm font-semibold text-gray-900 mb-2">
                                Timestamps:
                            </Text>
                            <Text className="text-sm text-gray-600 mb-1">
                                Created: {formatFullDate(notification.$createdAt)}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                Scheduled: {formatFullDate(notification.scheduledAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row justify-end gap-3">
                        {!notification.isRead && (
                            <TouchableOpacity
                                onPress={handleMarkAsRead}
                                className="px-2.5 py-1 bg-blue-100 rounded-full flex-row items-center gap-1 justify-center"
                            >
                                <Ionicons name="checkmark-done-outline" size={14} color="#2563eb" />
                                <Text className="text-xs text-blue-600 font-semibold">
                                    Mark As Read
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="py-1 px-2.5 bg-red-100 rounded-full flex-row items-center gap-1 justify-center"
                        >
                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                            <Text className="text-xs text-[#EF4444] font-semibold">
                                Delete Notification
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default NotificationModal;