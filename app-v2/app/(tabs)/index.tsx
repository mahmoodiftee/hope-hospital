import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Search } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "moti/skeleton";

import { useAuth } from "@/features/auth";
import { useNotificationStore } from "@/features/notifications";
import { useBooking, useAppointmentStore, AppointmentDetailsModal, ReviewModal, AppointmentBookingModal } from "@/features/appointments";
import { HeaderText, TopSection, images, topDoctorList, UpcomingConsultations, HospitalServices } from "@/shared/components";
import { TopDoctors, DoctorI, DoctorSearchModal } from "@/features/doctors";
import { HospitalGallery } from "@/features/gallery";

const UserTopSection = () => {
    // We are simulating fetchAuthenticatedUser with our generic useAuth
    const { user, dbUser, isLoading } = useAuth();
    // Assuming unreadCount exists or we mock it
    const unreadCount = useNotificationStore(state => state.unreadCount) || 0;

    if (isLoading) {
        return (
            <View className="py-4 mb-4">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-2">
                        <Skeleton colorMode="light" width={128} height={16} radius="round" />
                        <Skeleton colorMode="light" width={192} height={24} radius="round" />
                    </View>
                    <Skeleton colorMode="light" width={48} height={48} radius="round" />
                </View>
            </View>
        );
    }

    // Pass dbUser if it exists since it has the profile name
    // We show TopSection if either user is logged in (account exists) or we want the guest identity
    if ((dbUser || user) && !isLoading) {
        return <TopSection user={dbUser || user} unreadCount={unreadCount} />;
    }

    return null;
};

const AppointmentsSection = ({
    setSearchModalVisible,
}: {
    setSearchModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { user, dbUser, isAuthenticated } = useAuth();
    const phone = user?.phone || dbUser?.phone;

    const { isLoading, getUpcomingAppointments, fetchAppointments, refreshAppointments } = useAppointmentStore();

    // ── Details modal state ────────────────────────────────────────────────
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // ── Review modal state ─────────────────────────────────────────────────
    const [showReview, setShowReview] = useState(false);

    // ── Reschedule / re-book modal state ───────────────────────────────────
    const [showBooking, setShowBooking] = useState(false);
    const [isRescheduleMode, setIsRescheduleMode] = useState(false);

    useEffect(() => {
        if (phone) {
            fetchAppointments({ phone });
        }
    }, [phone, fetchAppointments]);

    const onRefresh = useCallback(() => {
        if (phone) {
            refreshAppointments({ phone });
        }
    }, [phone, refreshAppointments]);

    // ── Card press → Details modal ─────────────────────────────────────────
    const handleCardPress = (appointment: any) => {
        setSelectedAppointment(appointment);
        setShowDetails(true);
    };

    // ── Details modal → Reschedule ─────────────────────────────────────────
    const handleReschedule = () => {
        setShowDetails(false);
        setIsRescheduleMode(selectedAppointment?.status !== 'Cancelled');
        setTimeout(() => setShowBooking(true), 300);
    };

    // ── Details modal → Review ─────────────────────────────────────────────
    const handleWriteReview = () => {
        setShowDetails(false);
        setTimeout(() => setShowReview(true), 300);
    };

    // ── Booking modal close ────────────────────────────────────────────────
    const handleBookingClose = () => {
        setShowBooking(false);
        setIsRescheduleMode(false);
        onRefresh();
    };

    const upcomingAppointments = getUpcomingAppointments();

    if (isLoading && upcomingAppointments.length === 0) {
        return (
            <View className="w-full h-32 bg-gray-100 rounded-3xl mt-4 p-4 justify-between">
                <View className="flex-row justify-between">
                    <Skeleton colorMode="light" width={60} height={20} radius="round" />
                    <Skeleton colorMode="light" width={40} height={20} radius="round" />
                </View>
                <Skeleton colorMode="light" width={180} height={24} radius="round" />
            </View>
        );
    }

    if ((user || dbUser || isAuthenticated) && upcomingAppointments.length > 0) {
        return (
            <>
                <UpcomingConsultations
                    upcomingAppointments={upcomingAppointments}
                    loading={isLoading && upcomingAppointments.length === 0}
                    onPressCard={handleCardPress}
                />

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
                            specialty: selectedAppointment.specialty,
                            hourlyRate: selectedAppointment.amount,
                        }}
                        reschedule={isRescheduleMode}
                        rescheduleDetails={isRescheduleMode ? selectedAppointment : undefined}
                    />
                )}
            </>
        );
    }

    return <HospitalServices setSearchModalVisible={setSearchModalVisible} />;
};

export default function HomeScreen() {
    const [searchModalVisible, setSearchModalVisible] = useState(false);

    const { user, dbUser } = useAuth();
    const phone = user?.phone || dbUser?.phone;
    const { refreshAppointments, refreshing } = useAppointmentStore();

    const onRefresh = React.useCallback(() => {
        if (phone) {
            refreshAppointments({ phone });
        }
    }, [phone, refreshAppointments]);

    type SpecialistName = keyof typeof images;

    const specialists: { id: number; name: SpecialistName }[] = [
        { id: 1, name: "dental" },
        { id: 2, name: "heart" },
        { id: 3, name: "liver" },
        { id: 4, name: "lungs" },
        { id: 5, name: "kidney" },
    ];

    const topDoctors: DoctorI[] = topDoctorList || [];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3B82F6']}
                        tintColor="#3B82F6"
                    />
                }
            >
                <View className="py-4 pb-20">
                    <View className="px-4">
                        <UserTopSection />

                        <TouchableOpacity
                            onPress={() => setSearchModalVisible(true)}
                            className="flex-row items-center gap-3 bg-gray-50 rounded-2xl px-5 py-4 mb-6"
                            activeOpacity={0.95}
                        >
                            <Search color="#8E8E93" size={22} />
                            <Text className="flex-1 text-gray-400 font-medium text-base">
                                Find a doctor or specialist...
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <AppointmentsSection setSearchModalVisible={setSearchModalVisible} />

                    {/* <View className="mb-2 px-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <HeaderText title="Service We Provide" />
                        </View>
                        <View className="flex-row justify-between px-3">
                            {specialists.map((specialist) => (
                                <TouchableOpacity key={specialist.id}>
                                    <Image
                                        source={images[specialist.name]}
                                        className="size-[50px] rounded-full items-center justify-center mb-2"
                                    />
                                    <Text className="text-black/50 text-sm font-quicksand-bold text-center uppercase">
                                        {specialist.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View> */}

                    <View className="px-4">
                        {TopDoctors && topDoctors.length > 0 && (
                            <TopDoctors
                                onViewAll={() => router.push("/doctors")}
                                topDoctors={topDoctors}
                            />
                        )}

                        <HospitalGallery />
                    </View>

                    <DoctorSearchModal
                        visible={searchModalVisible}
                        onClose={() => setSearchModalVisible(false)}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
