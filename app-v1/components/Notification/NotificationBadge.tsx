import { NotificationIconConfig } from '@/types/notification';
import React from 'react';
import { Text, View } from 'react-native';

interface NotificationBadgeProps {
    type: string;
    iconConfig: NotificationIconConfig;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ type, iconConfig }) => {
    return (
        <View style={{ backgroundColor: iconConfig.bgColor }} className="px-2 py-1 rounded-md">
            <Text style={{ color: iconConfig.color }} className="text-xs font-medium capitalize">
                {type.replace('_', ' ')}
            </Text>
        </View>
    );
};

export default NotificationBadge;