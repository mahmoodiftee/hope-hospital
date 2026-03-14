import { hospitalConfig } from '@/config/hospitalConfig';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface HourCardProps {
    title: string;
    subtitle: string;
    icon: React.ComponentType<any>;
    iconName: string;
}

const HourCard: React.FC<HourCardProps> = ({ title, subtitle, icon: Icon, iconName }) => (
    <View
        className="bg-white rounded-2xl p-5 shadow-sm mb-3"
        style={hospitalConfig.ui.shadows.default}
    >
        <View className="flex-row justify-between items-center">
            <View className="flex-1">
                <Text className="text-black text-base font-semibold mb-1">{title}</Text>
                <Text className="text-black/70 text-sm">{subtitle}</Text>
            </View>
            <View className="opacity-80">
                <Icon name={iconName} size={24} color={hospitalConfig.ui.colors.primary} />
            </View>
        </View>
    </View>
);

export const OperatingHours: React.FC = () => {
    const { t } = useTranslation();

    return (
        <View className="mb-6 px-1">
            <View className="flex-row items-center mb-4">
                <Ionicons name="time" size={24} color={hospitalConfig.ui.colors.black} />
                <Text className="text-dark-100 text-xl font-bold ml-2">{t('contact.operatingHoursTitle')}</Text>
            </View>

            <HourCard
                title={t('contact.emergency247Title')}
                subtitle={hospitalConfig.hours.emergency}
                icon={FontAwesome5}
                iconName="ambulance"
            />

            <HourCard
                title={t('contact.opdTitle')}
                subtitle={hospitalConfig.hours.opd}
                icon={Ionicons}
                iconName="medical"
            />
        </View>
    );
};
