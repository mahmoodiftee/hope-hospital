import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface NotificationActionsProps {
    isRead: boolean;
    onMarkAsRead: () => void;
    onDelete: () => void;
}

const NotificationActions: React.FC<NotificationActionsProps> = ({
    isRead,
    onMarkAsRead,
    onDelete
}) => {
    return (
        <View className="flex-row items-center gap-2">
            {!isRead && (
                <TouchableOpacity
                    onPress={onMarkAsRead}
                    className="w-7 h-7 items-center justify-center rounded-full bg-blue-50"
                >
                    <Ionicons name="checkmark" size={14} color="#3B82F6" />
                </TouchableOpacity>
            )}
            <TouchableOpacity
                onPress={onDelete}
                className="w-7 h-7 items-center justify-center rounded-full bg-red-50"
            >
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );
};

export default NotificationActions;