import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Prescription } from '../types';

interface PrescriptionCardProps {
    prescription: Prescription;
    onViewPress?: (item: Prescription) => void;
    onDownloadPress?: (item: Prescription) => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
    prescription,
    onViewPress,
    onDownloadPress
}) => {
    const { t } = useTranslation();
    return (
        <View className="border border-gray-100 bg-white rounded-xl p-4 shadow-sm mb-3">
            <View className="flex-row items-start">
                <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-1"
                    style={{ backgroundColor: prescription.iconBg }}
                >
                    <Ionicons name={prescription.icon as any} size={20} color={prescription.iconColor} />
                </View>

                <View className="flex-1">
                    <Text style={{ color: prescription.iconColor }} className="text-dark-100 font-semibold text-sm mb-1">
                        {prescription.title}
                    </Text>
                    <Text className="text-gray-500 text-xs mb-3">
                        {prescription.date}
                    </Text>

                    <View className="flex-row items-center">
                        <TouchableOpacity
                            className="px-4 py-2 rounded-lg mr-3"
                            style={{ backgroundColor: prescription.iconBg }}
                            onPress={() => onViewPress?.(prescription)}
                            activeOpacity={0.7}
                        >
                            <Text
                                className="text-sm font-medium"
                                style={{ color: prescription.iconColor }}
                            >
                                {prescription.viewText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="px-4 py-2 rounded-lg flex-row items-center"
                            onPress={() => onDownloadPress?.(prescription)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="download-outline" color={prescription.iconColor} size={16} className="mr-1" />
                            <Text style={{ color: prescription.iconColor }} className="text-sm font-medium ml-1">
                                {t('records.download')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};
