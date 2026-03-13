import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

const EmptyNotifications: React.FC = () => {
    return (
        <View className="flex-1 justify-center items-center py-20">
            <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-6">
                <Ionicons name="notifications-outline" size={48} color="#007AFF" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-3">
                No notifications yet
            </Text>
            <Text className="text-gray-500 text-center px-8 text-lg">
                When you receive notifications, they&lsquo;ll appear here
            </Text>
        </View>
    );
};

export default EmptyNotifications;