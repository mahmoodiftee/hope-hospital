import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
    icon: string;
    iconColor?: string;
    bgClass?: string;
    title: string;
    subtitle?: string;
    titleClass?: string;
    onPress: () => void;
    showChevron?: boolean;
    badgeCount?: number;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
    icon,
    iconColor = '#3B82F6',
    bgClass = 'bg-blue-50/50',
    title,
    subtitle,
    titleClass = 'text-gray-900',
    onPress,
    showChevron = true,
    badgeCount
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center py-4"
            activeOpacity={0.7}
        >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${bgClass} relative`}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
                {badgeCount !== undefined && badgeCount > 0 && (
                    <View style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        backgroundColor: '#EF4444',
                        borderRadius: 999,
                        minWidth: badgeCount > 9 ? 22 : 18,
                        height: badgeCount > 9 ? 22 : 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: 'white',
                        paddingHorizontal: badgeCount > 9 ? 3 : 0,
                    }}>
                        <Text style={{
                            fontSize: 9,
                            color: 'white',
                            fontWeight: 'bold',
                            lineHeight: 12,
                            includeFontPadding: false,
                        }}>
                            {badgeCount > 9 ? '9+' : badgeCount}
                        </Text>
                    </View>
                )}
            </View>

            <View className="flex-1">
                <Text className={`font-bold text-base ${titleClass}`}>{title}</Text>
                {subtitle && (
                    <Text className="text-gray-400 font-medium text-xs mt-0.5" numberOfLines={1}>
                        {subtitle}
                    </Text>
                )}
            </View>

            {showChevron && (
                <View className="bg-gray-50 p-1.5 rounded-lg">
                    <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                </View>
            )}
        </TouchableOpacity>
    );
};
