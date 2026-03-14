import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth';
import {
    useAppointmentStore,
    AppointmentCard,
    AppointmentDetailsModal,
    ReviewModal,
    AppointmentBookingModal,
} from '@/features/appointments';
import { Appointment } from '@/shared/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseAppointmentDateTime } from '@/shared/utils/timeUtils';
import { BackHeader } from '@/shared/components/BackHeader';

const AppointmentsScreen = () => {
    const { t } = useTranslation();
    const { filter } = useLocalSearchParams<{ filter?: string }>();
    const { user, dbUser } = useAuth();
    const {
        appointments,
        isLoading,
        refreshing,
        fetchAppointments,
        refreshAppointments,
    } = useAppointmentStore();

    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        const now = new Date();
        if (filter === 'Completed') {
            setFilteredAppointments(appointments.filter(a => {
                if (a.status === 'Cancelled') return false;
                const dt = parseAppointmentDateTime(a.date, a.time);
                return dt <= now;
            }));
        } else if (filter === 'Upcoming') {
            setFilteredAppointments(appointments.filter(a => {
                if (a.status === 'Cancelled') return false;
                const dt = parseAppointmentDateTime(a.date, a.time);
                return dt > now;
            }));
        } else {
            setFilteredAppointments(appointments);
        }
    }, [appointments, filter]);

    const phone = user?.phone || dbUser?.phone;
    const userId = user?.id || dbUser?.$id;

    // ── Details modal state ────────────────────────────────────────────────
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // ── Review modal state ─────────────────────────────────────────────────
    const [showReview, setShowReview] = useState(false);

    // ── Reschedule / re-book modal state ───────────────────────────────────
    const [showBooking, setShowBooking] = useState(false);
    const [isRescheduleMode, setIsRescheduleMode] = useState(false);

    useEffect(() => {
        if (phone) {
            fetchAppointments({ phone }, true);
        }
    }, [phone, fetchAppointments]);

    const onRefresh = useCallback(() => {
        if (phone) {
            refreshAppointments({ phone });
        }
    }, [phone, refreshAppointments]);

    // ── Card press → Details modal ─────────────────────────────────────────
    const handleCardPress = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowDetails(true);
    };

    // ── Details modal → Reschedule ─────────────────────────────────────────
    const handleReschedule = () => {
        setShowDetails(false);
        setIsRescheduleMode(selectedAppointment?.status !== 'Cancelled');
        setTimeout(() => setShowBooking(true), 600); // small delay to avoid modal overlap
    };

    // ── Details modal → Review ─────────────────────────────────────────────
    const handleWriteReview = () => {
        setShowDetails(false);
        setTimeout(() => setShowReview(true), 600);
    };

    // ── Booking modal close ────────────────────────────────────────────────
    const handleBookingClose = () => {
        setShowBooking(false);
        setIsRescheduleMode(false);
        onRefresh();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom', 'left', 'right']}>
            <BackHeader
                title={filter === 'Completed' ? t('appointments.totalVisits') : filter === 'Upcoming' ? t('appointments.upcomingVisits') : t('appointments.title')}
            />

            <View className="flex-1 px-5">
                {isLoading && !refreshing ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredAppointments}
                        keyExtractor={(item) => item.$id!}
                        renderItem={({ item }) => (
                            <AppointmentCard
                                appointment={item}
                                onPress={() => handleCardPress(item)}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#3B82F6']}
                                tintColor="#3B82F6"
                            />
                        }
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center pt-20">
                                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
                                </View>
                                <Text className="text-gray-500 font-bold text-lg">
                                    {filter === 'Completed' ? t('appointments.noCompleted') : filter === 'Upcoming' ? t('appointments.noUpcoming') : t('appointments.noAppointments')}
                                </Text>
                                <Text className="text-gray-400 font-medium text-center px-10 mt-2">
                                    {filter === 'Completed' ? t("appointments.noCompletedSub") : filter === 'Upcoming' ? t("appointments.noUpcomingSub") : t("appointments.noAppointmentsSub")}
                                </Text>
                            </View>
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
                    />
                )}
            </View>

            {/* ── Appointment Details Modal ── */}
            {selectedAppointment && (
                <AppointmentDetailsModal
                    appointment={selectedAppointment}
                    visible={showDetails}
                    onClose={() => setShowDetails(false)}
                    onReschedule={handleReschedule}
                    onWriteReview={handleWriteReview}
                    onRefresh={onRefresh}
                />
            )}

            {/* ── Review Modal ── */}
            {selectedAppointment && (
                <ReviewModal
                    appointment={selectedAppointment}
                    visible={showReview}
                    onClose={() => setShowReview(false)}
                    onSuccess={onRefresh}
                />
            )}

            {/* ── Booking / Reschedule Modal ── */}
            {selectedAppointment && (
                <AppointmentBookingModal
                    isVisible={showBooking}
                    onClose={handleBookingClose}
                    doctor={{
                        id: typeof selectedAppointment.doctorId === 'string'
                            ? selectedAppointment.doctorId
                            : (selectedAppointment.doctorId as any)?.$id || '',
                        name: selectedAppointment.doctor_name,
                        name_bn: selectedAppointment.doctor_name_bn,
                        specialty: selectedAppointment.specialty,
                        specialty_bn: selectedAppointment.specialty_bn,
                        hourlyRate: selectedAppointment.amount,
                    }}
                    reschedule={isRescheduleMode}
                    rescheduleDetails={isRescheduleMode ? selectedAppointment : undefined}
                />
            )}
        </SafeAreaView>
    );
};

export default AppointmentsScreen;
