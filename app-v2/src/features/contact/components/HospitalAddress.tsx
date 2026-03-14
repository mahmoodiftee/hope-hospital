import { hospitalConfig } from '@/config/hospitalConfig';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const HospitalAddress: React.FC = () => {
    const { t } = useTranslation();

    return (
        <View className="mb-6 px-1">
            <View
                className="bg-white rounded-2xl p-5 shadow-sm"
                style={hospitalConfig.ui.shadows.default}
            >
                <View className="flex-row items-center mb-2">
                    <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                        <Ionicons name="location" size={24} color={hospitalConfig.ui.colors.primary} />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-dark-100 text-base font-semibold mb-1">
                            {t('contact.hospitalAddressTitle')}
                        </Text>
                        <Text className="text-gray-500 text-sm leading-5">
                            {hospitalConfig.hospital.address}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};
