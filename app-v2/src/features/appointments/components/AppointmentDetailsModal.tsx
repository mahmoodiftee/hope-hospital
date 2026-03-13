import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { Calendar, Clock, Phone, User, X, XCircle } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { Appointment } from '@/shared/types';
import { useAuth } from '@/features/auth';
import { useAppointmentStore } from '../stores/appointment.store';
import { useNotificationStore } from '@/features/notifications';
import { AppointmentService } from '../services/appointment.service';
import { parseAppointmentDateTime } from '@/shared/utils/timeUtils';

interface AppointmentDetailsModalProps {
    appointment: Appointment;
    visible: boolean;
    onClose: () => void;
    onReschedule: () => void;
    onWriteReview: () => void;
    onRefresh: () => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
    appointment,
    visible,
    onClose,
    onReschedule,
    onWriteReview,
    onRefresh,
}) => {
    const { user, dbUser } = useAuth();
    const { cancelAppointment } = useAppointmentStore();
    const { refreshUnreadCount, fetchNotifications } = useNotificationStore();

    const [showModal, setShowModal] = useState(visible);
    const [isLoading, setIsLoading] = useState(false);
    const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const userId = user?.id || dbUser?.$id || '';
    const isCancelled = appointment.status === 'Cancelled';
    const isCompleted = appointment.status === 'Completed';
    const isUpcoming = useMemo(() => {
        if (isCancelled || isCompleted) return false;
        return parseAppointmentDateTime(appointment.date, appointment.time) > new Date();
    }, [appointment.date, appointment.time, isCancelled, isCompleted]);

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.parallel([
                Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, { toValue: Dimensions.get('window').height, duration: 250, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start(() => setShowModal(false));
        }
    }, [visible]);

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return dateStr; }
    };

    const handleCancel = async () => {
        if (isLoading || !appointment.$id) return;

        setIsLoading(true);
        try {
            await cancelAppointment(appointment.$id);

            // Write cancellation notification
            if (userId) {
                await AppointmentService.createNotification({
                    userId,
                    type: 'appointment_cancelled',
                    title: 'Appointment Cancelled',
                    message: `Your appointment with ${appointment.doctor_name} has been cancelled.`,
                    priority: 3,
                    appointmentId: appointment.$id,
                    metadata: {
                        doctorName: appointment.doctor_name,
                        specialty: appointment.specialty,
                        date: appointment.date,
                        time: appointment.time,
                        amount: appointment.amount,
                    },
                });
                await refreshUnreadCount(userId);
                await fetchNotifications(userId);
            }

            onRefresh();
            toast.success('Appointment cancelled successfully!');
        } catch (error: any) {
            toast.error('Failed to cancel appointment. Please try again.');
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    if (!showModal) return null;

    return (
        <Modal transparent visible={showModal} animationType="none">
            <Animated.View style={{ opacity }} className="absolute inset-0 bg-black/50">
                <Pressable className="flex-1" onPress={onClose} />
            </Animated.View>

            <Animated.View
                style={{ transform: [{ translateY }] }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 max-h-[94%]"
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                    {/* Handle bar */}
                    <View className="self-center w-10 h-1 bg-gray-300 rounded-full mb-4" />

                    {/* Close button */}
                    <View className="w-full flex items-end mb-2">
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-gray-50 justify-center items-center"
                            onPress={onClose}
                        >
                            <X color="rgba(0,0,0,1)" size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Cancelled Badge */}
                    {isCancelled && (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                            <View className="flex-row items-center">
                                <XCircle size={20} color="#dc2626" />
                                <Text className="text-red-600 font-bold ml-2">
                                    This appointment has been cancelled
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Doctor Header */}
                    <View className="items-center py-4">
                        {/* @ts-ignore — doctorId may be populated with nested object for image */}
                        {appointment.doctorId?.image ? (
                            <Image
                                //@ts-ignore
                                source={{ uri: appointment.doctorId.image }}
                                className="w-24 h-24 rounded-full mb-3"
                            />
                        ) : (
                            <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-3">
                                <User size={40} color="#3b82f6" />
                            </View>
                        )}
                        <Text className="text-2xl font-bold text-gray-900 text-center">
                            {appointment.doctor_name}
                        </Text>
                        <Text className="text-base text-gray-600 font-medium mt-1">
                            {appointment.specialty}
                        </Text>
                    </View>

                    {/* Appointment Details Grid */}
                    <View className="mb-6 bg-gray-50 rounded-xl p-4">
                        <View className="flex-row gap-4 mb-4">
                            <DetailCard
                                icon={<Clock size={14} color="#9CA3AF" />}
                                label="Time"
                                value={appointment.time}
                            />
                            <DetailCard
                                icon={<Calendar size={14} color="#9CA3AF" />}
                                label="Date"
                                value={formatDate(appointment.date)}
                            />
                        </View>
                        <View className="flex-row gap-4 mb-4">
                            <DetailCard
                                icon={<User size={14} color="#9CA3AF" />}
                                label="Patient"
                                value={`${appointment.patient_name}, ${appointment.patient_age}`}
                            />
                            <DetailCard
                                icon={<Phone size={14} color="#9CA3AF" />}
                                label="Contact"
                                value={appointment.contactNumber}
                            />
                        </View>
                        {/* Consultation Fee */}
                        <View className="bg-white p-3 rounded-lg">
                            <Text className="text-xs text-gray-400 mb-1">Consultation Fee</Text>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-gray-800 font-bold">৳{appointment.amount}</Text>
                                <Text className={`text-xs px-2 py-1 rounded-full ${isCancelled ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                                    {isCancelled ? 'Refunded' : 'Paid'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Doctor Specialties */}
                    {/* @ts-ignore */}
                    {appointment.doctorId?.specialties && (
                        <View className="mb-6 px-2">
                            <Text className="text-sm font-bold text-gray-900 mb-3">Specializations</Text>
                            <View className="flex-row flex-wrap">
                                {/* @ts-ignore */}
                                {appointment.doctorId.specialties.map((s: string, i: number) => (
                                    <View key={i} className="bg-blue-50 px-3 py-1.5 rounded-full mr-2 mb-2">
                                        <Text className="text-blue-600 text-xs font-medium">
                                            {s.split(' - ')[0]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Doctor Bio */}
                    {/* @ts-ignore */}
                    {appointment.doctorId?.experience && (
                        <View className="mb-6 px-2">
                            <Text className="font-bold text-gray-900 mb-2">About Doctor</Text>
                            {/* @ts-ignore */}
                            <Text className="text-gray-600 font-medium">{appointment.doctorId.experience}</Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    {isCancelled ? (
                        <TouchableOpacity
                            className="py-3 bg-blue-50 border border-blue-200 rounded-xl items-center mx-2"
                            onPress={onReschedule}
                        >
                            <Text className="text-blue-600 font-bold">Book New Appointment</Text>
                        </TouchableOpacity>
                    ) : isUpcoming ? (
                        <View className="flex-row gap-3 px-2">
                            <TouchableOpacity
                                className="flex-1 py-3 border border-red-100 bg-red-50 rounded-xl items-center"
                                onPress={handleCancel}
                                disabled={isLoading}
                            >
                                <Text className="text-red-500 font-bold">
                                    {isLoading ? 'Cancelling...' : 'Cancel'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 py-3 bg-blue-50 border border-blue-200 rounded-xl items-center"
                                onPress={onReschedule}
                                disabled={isLoading}
                            >
                                <Text className="text-blue-600 font-bold">Reschedule</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            className="py-3 bg-blue-50 border border-blue-200 rounded-xl items-center mx-2"
                            onPress={onWriteReview}
                        >
                            <Text className="text-blue-600 font-bold">Write a Review</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </Animated.View>
        </Modal>
    );
};

// ── Sub-component ──────────────────────────────────────────────────────────

const DetailCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
    icon, label, value,
}) => (
    <View className="flex-1">
        <View className="bg-white p-3 rounded-lg">
            <View className="flex-row items-center gap-1 mb-1">
                {icon}
                <Text className="text-sm text-gray-400 font-medium">{label}</Text>
            </View>
            <Text className="text-gray-600 font-medium text-sm">{value}</Text>
        </View>
    </View>
);
