// components/ContactCard.tsx
import { hospitalConfig } from '@/config/hospitalConfig';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ContactCardProps {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  onPress: () => void;
  bgColor?: string;
  iconColor?: string;
  titleColor?: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  bgColor = 'bg-white',
  iconColor = hospitalConfig.ui.colors.gray,
  titleColor = 'text-dark-100'
}) => (
  <TouchableOpacity
    className={`${bgColor} rounded-2xl p-5 shadow-sm active:scale-95`}
    onPress={onPress}
    style={hospitalConfig.ui.shadows.default}
  >
    <View className="mb-3">
      <Icon size={24} color={iconColor} strokeWidth={2} />
    </View>
    <Text className={`${titleColor} text-base font-semibold`}>{title}</Text>
    <Text className={`${titleColor === 'text-white' ? 'text-white' : 'text-black/70'} text-sm`}>
      {subtitle}
    </Text>
  </TouchableOpacity>
);