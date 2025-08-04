import { NotificationIconConfig } from '@/types/notification';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface NotificationIconProps {
    iconConfig: NotificationIconConfig;
    size?: number;
    showUnreadDot?: boolean;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
    iconConfig,
    size = 20,
    showUnreadDot = false
}) => {
    const containerSize = size === 20 ? 'w-11 h-11' : 'w-12 h-12';
    const borderRadius = size === 20 ? 'rounded-xl' : 'rounded-2xl';

    return (
        <View className="relative">
            <View
                className={`${containerSize} ${borderRadius} items-center justify-center`}
                style={{ backgroundColor: iconConfig.bgColor }}
            >
                <Ionicons
                    name={iconConfig.name as any}
                    size={size}
                    color={iconConfig.color}
                />
            </View>
            {showUnreadDot && (
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
            )}
        </View>
    );
};

export default NotificationIcon;