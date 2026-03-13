import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appointment } from '@/shared/types';

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
    const isUpcoming = appointment.status === 'Upcoming';
    const isCancelled = appointment.status === 'Cancelled';
    const isCompleted = !isUpcoming && !isCancelled;

    const statusColor = isUpcoming ? 'text-blue-500' : isCancelled ? 'text-red-500' : 'text-green-500';
    const statusBg = isUpcoming ? 'bg-blue-50' : isCancelled ? 'bg-red-50' : 'bg-green-50';

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
            activeOpacity={0.7}
            className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
        >
            <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 mr-3">
                    <Text className="text-xl font-bold text-gray-900">{appointment.doctor_name}</Text>
                    <Text className="text-gray-500 font-medium">{appointment.specialty}</Text>
                </View>
                <View className={`${statusBg} px-3 py-1 rounded-full`}>
                    <Text className={`${statusColor} font-bold text-xs uppercase tracking-wider`}>
                        {appointment.status || 'Upcoming'}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center space-x-4 mb-2">
                <View className="flex-row items-center mr-6">
                    <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                    <Text className="text-gray-600 font-bold ml-2">
                        {formatDate(appointment.date)}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={18} color="#6B7280" />
                    <Text className="text-gray-600 font-bold ml-2">{appointment.time}</Text>
                </View>
            </View>

            {/* Patient & fee row */}
            <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-50">
                <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={16} color="#9CA3AF" />
                    <Text className="text-gray-400 font-medium text-sm ml-1">
                        {appointment.patient_name}
                    </Text>
                </View>
                <Text className="text-gray-600 font-bold text-sm">৳{appointment.amount}</Text>
            </View>

            {/* Tap hint for upcoming */}
            {isUpcoming && (
                <View className="mt-3 items-center">
                    <Text className="text-gray-300 font-medium text-xs">
                        Tap to view details, reschedule, or cancel
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};
