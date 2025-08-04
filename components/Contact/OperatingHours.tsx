// components/OperatingHours.tsx
import { hospitalConfig } from '@/config/hospitalConfig';
import { Ambulance, Clock, Stethoscope } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface HourCardProps {
    title: string;
    subtitle: string;
    icon: React.ComponentType<any>;
}

const HourCard: React.FC<HourCardProps> = ({ title, subtitle, icon: Icon }) => (
    <View
        className="bg-white rounded-2xl p-5 shadow-sm mb-2"
        style={hospitalConfig.ui.shadows.default}
    >
        <View className="flex-row justify-between items-center">
            <View className="flex-1">
                <Text className="text-black text-base font-semibold mb-1">{title}</Text>
                <Text className="text-black/70 text-sm">{subtitle}</Text>
            </View>
            <View className="opacity-60">
                <Icon size={24} color={hospitalConfig.ui.colors.black} strokeWidth={2} />
            </View>
        </View>
    </View>
);

export const OperatingHours: React.FC = () => (
    <View className="mb-6">
        <View className="flex-row items-center mb-2">
            <Clock size={24} color={hospitalConfig.ui.colors.black} strokeWidth={2} />
            <Text className="text-dark-100 text-xl font-bold ml-2">Operating Hours</Text>
        </View>

        <HourCard
            title="Emergency Available 24/7"
            subtitle={hospitalConfig.hours.emergency}
            icon={Ambulance}
        />

        <HourCard
            title="OPD Available"
            subtitle={hospitalConfig.hours.opd}
            icon={Stethoscope}
        />
    </View>
);