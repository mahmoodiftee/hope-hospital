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
            case 'appointment_confirmation': return { name: 'checkmark-done-outline', color: '#22C55E', bg: 'bg-green-50' };
            case 'appointment_reminder': return { name: 'alarm', color: '#FBBF24', bg: 'bg-yellow-50' };
            case 'appointment_cancelled': return { name: 'close-circle-outline', color: '#EF4444', bg: 'bg-red-50' };
            default: return { name: 'notifications', color: '#6B7280', bg: 'bg-gray-50' };
        }
    };

    const iconInfo = getIcon();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className={`mx-4 mb-4 rounded-[28px] p-4 flex-row border ${isRead ? 'bg-white border-gray-100/50 shadow-sm shadow-black/5' : 'bg-blue-50/40 border-blue-100 shadow-md shadow-blue-500/10'}`}
        >
            <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${iconInfo.bg} shadow-inner`}>
                <Ionicons name={iconInfo.name as any} size={28} color={iconInfo.color} />
            </View>

            <View className="flex-1 justify-center">
                <View className="flex-row justify-between items-start mb-1">
                    <Text
                        numberOfLines={1}
                        className={`text-[17px] flex-1 mr-2 tracking-tight ${isRead ? 'font-bold text-gray-700' : 'font-black text-gray-900'}`}
                    >
                        {notification.title}
                    </Text>
                    {!isRead && (
                        <View className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 shadow-sm shadow-blue-500" />
                    )}
                </View>
                <Text
                    numberOfLines={2}
                    className={`text-sm leading-5 mb-2 ${isRead ? 'text-gray-500 font-medium' : 'text-gray-700 font-bold'}`}
                >
                    {notification.message}
                </Text>
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                    <Text className="text-gray-400 font-bold text-[10px] ml-1 uppercase tracking-wider">
                        {new Date(notification.$createdAt!).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

