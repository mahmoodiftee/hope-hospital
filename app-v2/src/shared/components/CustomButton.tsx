import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { getTypographyStyle } from '@/shared/utils/typography';

interface CustomButtonProps extends TouchableOpacityProps {
    title: string;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    textClassName?: string;
    leftIcon?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    isLoading = false,
    variant = 'primary',
    className,
    textClassName,
    leftIcon,
    onPress,
    disabled,
    ...props
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary': return 'bg-gray-100';
            case 'danger': return 'bg-red-500';
            case 'ghost': return 'bg-transparent';
            default: return 'bg-blue-500';
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'secondary': return 'text-gray-900';
            case 'ghost': return 'text-blue-500';
            default: return 'text-white';
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            className={`
                h-14 rounded-2xl items-center justify-center flex-row px-6
                ${getVariantStyles()}
                ${disabled || isLoading ? 'opacity-50' : 'active:scale-[0.98]'}
                ${className}
            `}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'secondary' ? '#1F2937' : '#FFFFFF'} />
            ) : (
                <>
                    {leftIcon && <View className="mr-2">{leftIcon}</View>}
                    <Text
                        className={`text-base ${getTextColor()} ${textClassName}`}
                        style={getTypographyStyle('bold', 16)}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};
