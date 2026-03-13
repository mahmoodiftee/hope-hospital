import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/shared/types';

interface NotificationItemProps {
    notification: Notification;
    onPress: () => void;
}

/**
 * NotificationItem — consistent UI for various notification types.
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
    const isRead = notification.isRead;

    const getIcon = () => {
        switch (notification.type) {
            case 'appointment_confirmation': return { name: 'calendar-check', color: '#3B82F6', bg: 'bg-blue-50' };
            case 'appointment_reminder': return { name: 'alarm', color: '#FBBF24', bg: 'bg-yellow-50' };
            case 'appointment_cancelled': return { name: 'calendar-outline', color: '#EF4444', bg: 'bg-red-50' };
            default: return { name: 'notifications', color: '#6B7280', bg: 'bg-gray-50' };
        }
    };

    const iconInfo = getIcon();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`flex-row p-5 border-b border-gray-50 ${isRead ? 'bg-white' : 'bg-blue-50/30'}`}
        >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${iconInfo.bg}`}>
                <Ionicons name={iconInfo.name as any} size={24} color={iconInfo.color} />
            </View>

            <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                    <Text className={`text-base flex-1 mr-2 ${isRead ? 'font-bold text-gray-800' : 'font-bold text-gray-900'}`}>
                        {notification.title}
                    </Text>
                    {!isRead && <View className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                </View>
                <Text className="text-gray-500 font-medium text-sm leading-5 mb-2">
                    {notification.message}
                </Text>
                <Text className="text-gray-400 font-medium text-xs">
                    {new Date(notification.$createdAt!).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

