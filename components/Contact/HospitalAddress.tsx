// components/HospitalAddress.tsx
import { hospitalConfig } from '@/config/hospitalConfig';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

export const HospitalAddress: React.FC = () => (
    <View className="mb-6">
        <View
            className="bg-white rounded-2xl p-5 shadow-sm"
            style={hospitalConfig.ui.shadows.default}
        >
            <View className="flex-row items-center mb-2">
                <MapPin size={24} color={hospitalConfig.ui.colors.gray} strokeWidth={2} />
                <View className="ml-3 flex-1">
                    <Text className="text-dark-100 text-base font-semibold mb-1">
                        Hospital Address
                    </Text>
                    <Text className="text-gray-500 text-sm leading-5">
                        {hospitalConfig.hospital.address}
                    </Text>
                </View>
            </View>
        </View>
    </View>
);