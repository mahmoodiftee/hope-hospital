import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Appointment } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { getTranslatedField, formatLocalizedNumber, formatLocalizedTime } from '@/shared/utils/translation';
import { getTypographyStyle } from '@/shared/utils/typography';
import { images } from '@/shared/components';

interface AppointmentCardProps {
    appointment: Appointment;
    onPress?: () => void;
}

/**
 * AppointmentCard — unified card for upcoming, completed, or cancelled appointments.
 * Tapping opens the AppointmentDetailsModal (handled by the parent).
 */
export const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    onPress,
}) => {
    const { t, i18n } = useTranslation();
    const isUpcoming = appointment.status === 'Upcoming';
    const isCancelled = appointment.status === 'Cancelled';
    const isCompleted = !isUpcoming && !isCancelled;

    const statusConfig = {
        Upcoming: { color: '#2563EB', bg: 'bg-blue-50', border: 'border-blue-100', icon: 'time-outline' },
        Cancelled: { color: '#DC2626', bg: 'bg-red-50', border: 'border-red-100', icon: 'close-circle-outline' },
        Completed: { color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'checkmark-circle-outline' }
    };

    const config = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.Upcoming;

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const SpecialtyIcon = ({ specialty }: { specialty: string }) => {
        const s = specialty?.toLowerCase();
        if (s === 'heart') return <Ionicons name="heart" size={12} color="#1D4ED8" />;
        if (s === 'dental') return <MaterialCommunityIcons name="tooth" size={12} color="#1D4ED8" />;
        if (s === 'lungs') return <MaterialCommunityIcons name="lungs" size={12} color="#1D4ED8" />;

        // For kidney and liver, we use the PNG icons
        if (s === 'kidney' || s === 'liver') {
            const iconKey = s + 'Icon';
            const source = images[iconKey];
            if (!source) return <Ionicons name="medical" size={12} color="#1D4ED8" />;
            return (
                <Image
                    source={source}
                    style={{ width: 12, height: 12 }}
                    tintColor="#1D4ED8"
                />
            );
        }

        return <Ionicons name="medical" size={12} color="#1D4ED8" />;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="bg-white rounded-[32px] mb-4 border border-gray-100 overflow-hidden"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 16,
                elevation: 4
            }}
        >
            <View className="p-6">
                {/* Header: Specialty & Status */}
                <View className="flex-row justify-between items-center mb-1">
                    <View className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex-row items-center gap-1.5">
                        <SpecialtyIcon specialty={appointment.specialty} />
                        <Text
                            className="text-blue-600 uppercase tracking-wide"
                            style={[{ color: '#2563EB' }, getTypographyStyle('black', 10)]}
                        >
                            {getTranslatedField(appointment, 'specialty', i18n.language)}
                        </Text>
                    </View>
                    <View className={`${config.bg} px-3 py-1.5 rounded-xl border ${config.border} flex-row items-center gap-1.5`}>
                        <Ionicons name={config.icon as any} size={12} color={config.color} />
                        <Text
                            className="uppercase tracking-wide"
                            style={[{ color: config.color }, getTypographyStyle('black', 10)]}
                        >
                            {appointment.status ? t(`appointments.card.status.${appointment.status.toLowerCase()}`) : t('appointments.card.status.upcoming')}
                        </Text>
                    </View>
                </View>

                {/* Main Body: Doctor Info */}
                <View className="mb-3">
                    <Text
                        className="text-gray-900 leading-tight mb-1"
                        numberOfLines={1}
                        style={getTypographyStyle('black', 20)}
                    >
                        {getTranslatedField(appointment, 'doctor_name', i18n.language)}
                    </Text>
                </View>

                {/* Info Block: Date and Time in a high-contrast container */}
                <View className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
                    <View className="flex-1 flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-white items-center justify-center border border-gray-100 mr-3">
                            <Ionicons name="calendar" size={14} color="#3B82F6" />
                        </View>
                        <View>
                            <Text className="text-gray-400 uppercase" style={getTypographyStyle('bold', 8)}>{t('appointments.details.date')}</Text>
                            <Text className="text-gray-900" style={getTypographyStyle('black', 13)}>
                                {formatDate(appointment.date)}
                            </Text>
                        </View>
                    </View>
                    <View className="w-[1px] h-8 bg-gray-200 mx-4" />
                    <View className="flex-1 flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-white items-center justify-center border border-gray-100 mr-3">
                            <Ionicons name="time" size={14} color="#3B82F6" />
                        </View>
                        <View>
                            <Text className="text-gray-400 uppercase" style={getTypographyStyle('bold', 8)}>{t('appointments.details.time')}</Text>
                            <Text className="text-gray-900" style={getTypographyStyle('black', 13)}>
                                {formatLocalizedTime(appointment.time, i18n.language)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer: Patient & Amount */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3 border-2 border-white">
                            <Ionicons name="person" size={18} color="#4B5563" />
                        </View>
                        <View>
                            <Text className="text-gray-900" style={getTypographyStyle('medium', 12)}>{t('appointments.details.patient')}</Text>
                            <Text
                                className="text-gray-900"
                                style={getTypographyStyle('black', 15)}
                            >
                                {getTranslatedField(appointment, 'patient_name' as any, i18n.language) || appointment.patient_name}
                            </Text>
                        </View>
                    </View>
                    <View className="bg-gray-100 px-4 py-2.5 rounded-2xl">
                        <Text className="text-gray-900" style={getTypographyStyle('black', 15)}>
                            ৳ {formatLocalizedNumber(appointment.amount, i18n.language)}
                        </Text>
                    </View>
                </View>

                {/* Hint for tap */}
                {isUpcoming && (
                    <View className="mt-5 pt-4 border-t border-gray-50 flex-row items-center justify-center">
                        <Text
                            className="text-gray-400 uppercase tracking-widest"
                            style={getTypographyStyle('bold', 9)}
                        >
                            {t('appointments.card.tapHint')}
                        </Text>
                        <Ionicons name="chevron-forward" size={12} color="#D1D5DB" className="ml-1" />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};
