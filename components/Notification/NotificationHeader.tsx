import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NotificationHeaderProps {
    unreadCount: number;
    onMarkAllAsRead: () => void;
    onDeleteAll: () => void;
    hasNotifications: boolean;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
    unreadCount,
    onMarkAllAsRead,
    onDeleteAll,
    hasNotifications
}) => {
    const router = useRouter();

    return (
        <>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center mb-1.5">
                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        className="mr-3"
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-900">
                        Notifications
                    </Text>
                    {unreadCount > 0 && (
                        <View className="ml-3 px-3 py-1 bg-red-500 rounded-full">
                            <Text className="text-sm text-white font-bold">
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            <View className="flex-row items-center justify-between">
                <View className=""></View>
                <View className="flex-row gap-2">
                    {unreadCount > 0 && (
                        <TouchableOpacity
                            onPress={onMarkAllAsRead}
                            className="px-2.5 py-1 bg-blue-100 rounded-full flex-row items-center gap-1 justify-center"
                        >
                            <Ionicons name="checkmark-done-outline" size={14} color="#2563eb" />
                            <Text className="text-xs text-blue-600 font-semibold">
                                Mark All Read
                            </Text>
                        </TouchableOpacity>
                    )}

                    {hasNotifications && (
                        <TouchableOpacity
                            onPress={onDeleteAll}
                            className="py-1 px-2.5 bg-red-100 rounded-full flex-row items-center gap-1 justify-center"
                        >
                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                            <Text className="text-xs text-[#EF4444] font-semibold">
                                Delete All
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </>
    );
};

export default NotificationHeader;