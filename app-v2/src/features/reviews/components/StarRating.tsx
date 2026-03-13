import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    readonly?: boolean;
    activeColor?: string;
    inactiveColor?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    size = 24,
    readonly = false,
    activeColor = '#F59E0B', // Amber 500
    inactiveColor = '#D1D5DB', // Gray 300
}) => {
    return (
        <View className="flex-row items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    activeOpacity={readonly ? 1 : 0.7}
                    onPress={() => !readonly && onRatingChange?.(star)}
                    disabled={readonly}
                >
                    <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={size}
                        color={star <= rating ? activeColor : inactiveColor}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};
