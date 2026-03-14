import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appointment } from '@/shared/types';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const isUpcoming = appointment.status === 'Upcoming';
    const isCancelled = appointment.status === 'Cancelled';
    const isCompleted = !isUpcoming && !isCancelled;

    const statusConfig = {
        Upcoming: { color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100/50', icon: 'time-outline' },
        Cancelled: { color: 'text-red-500', bg: 'bg-red-50/50', border: 'border-red-100/50', icon: 'close-circle-outline' },
        Completed: { color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100/50', icon: 'checkmark-circle-outline' }
    };

    const config = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.Upcoming;

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="bg-white rounded-[28px] mb-4 border border-gray-100/60 overflow-hidden"
            style={{
                shadowColor: '#60A5FA',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 12,
                elevation: 3
            }}
        >
            <View className="p-5">
                {/* Header: Status Pill & Doctor Info */}
                <View className="flex-row justify-between items-start mb-5">
                    <View className="flex-1 mr-4">
                        <Text className="text-[10px] text-blue-500 font-bold uppercase tracking-[1.5px] mb-1">
                            {appointment.specialty}
                        </Text>
                        <Text className="text-lg font-bold text-gray-900 leading-tight" numberOfLines={1}>
                            {appointment.doctor_name}
                        </Text>
                    </View>
                    <View className={`${config.bg} px-3 py-1.5 rounded-2xl border ${config.border} flex-row items-center gap-1.5`}>
                        <Ionicons name={config.icon as any} size={12} color={config.color.replace('text-', '')} />
                        <Text className={`${config.color} font-bold text-[10px] uppercase tracking-wide`}>
                            {appointment.status ? t(`appointments.card.status.${appointment.status.toLowerCase()}`) : t('appointments.card.status.upcoming')}
                        </Text>
                    </View>
                </View>

                {/* Info Grid: Date & Time in a unified background */}
                <View className="flex-row items-center bg-gray-50/40 rounded-2xl p-3 mb-5 border border-gray-50">
                    <View className="flex-1 flex-row items-center justify-center border-r border-gray-200/50">
                        <Ionicons name="calendar-clear-outline" size={14} color="#6B7280" />
                        <Text className="text-gray-700 font-bold ml-2 text-xs">
                            {formatDate(appointment.date)}
                        </Text>
                    </View>
                    <View className="flex-1 flex-row items-center justify-center">
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text className="text-gray-700 font-bold ml-2 text-xs">{appointment.time}</Text>
                    </View>
                </View>

                {/* Footer: Patient & Amount */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                            <Ionicons name="person-outline" size={14} color="#3B82F6" />
                        </View>
                        <View>
                            <Text className="text-gray-900 font-bold text-sm">
                                {appointment.patient_name}
                            </Text>
                            <Text className="text-[10px] text-gray-400 font-medium">Patient</Text>
                        </View>
                    </View>
                    <View className="items-end bg-blue-50/80 px-4 py-2 rounded-2xl">
                        <Text className="text-blue-600 font-black text-base">৳{appointment.amount}</Text>
                    </View>
                </View>

                {/* Tap Prompt (More subtle) */}
                {isUpcoming && (
                    <View className="mt-5 pt-4 border-t border-gray-50 flex-row items-center justify-center">
                        <Text className="text-gray-300 font-bold text-[9px] uppercase tracking-widest">
                            {t('appointments.card.tapHint')}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};
