import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Search } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "moti/skeleton";
import { useAuth } from "@/features/auth";
import { useNotificationStore } from "@/features/notifications";
import { useBooking, useAppointmentStore, AppointmentDetailsModal, ReviewModal, AppointmentBookingModal } from "@/features/appointments";
import { HeaderText, TopSection, images, topDoctorList, UpcomingConsultations, HospitalServices, LanguageSwitcher, LanguageSelectionModal } from "@/shared/components";
import { TopDoctors, DoctorI, DoctorSearchModal } from "@/features/doctors";
import { HospitalGallery } from "@/features/gallery";
import { useTranslation } from 'react-i18next';

const UserTopSection = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, dbUser, isLoading } = useAuth();
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

    if ((dbUser || user) && !isLoading) {
        return <TopSection user={dbUser || user} unreadCount={unreadCount} />;
    } else {
        return (
            <View className="rounded-[32px] overflow-hidden mb-6" style={{ elevation: 5, shadowColor: '#3B82F6', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
                <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View className="p-6 relative">
                        <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <View className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />

                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 mr-4">
                                <Text className="font-bold text-xs uppercase tracking-[2px] mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {t('home.welcome')}
                                </Text>
                                <Text className="text-white text-2xl font-black leading-tight">
                                    {t('home.welcomeTagLine')}
                                </Text>
                            </View>
                            <View className="p-1 rounded-full border backdrop-blur-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                                <LanguageSwitcher />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push('/(auth)/sign-in')}
                            className="mt-6 self-start flex-row items-center px-5 py-2.5 rounded-2xl border"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        >
                            <Text className="text-white font-bold text-xs mr-2">{t('auth.login')}</Text>
                            <Ionicons name="arrow-forward" size={12} color="white" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        );
    }
};

const AppointmentsSection = ({
    setSearchModalVisible,
}: {
    setSearchModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { user, dbUser, isAuthenticated } = useAuth();
    const phone = user?.phone || dbUser?.phone;

    const { isLoading, getUpcomingAppointments, fetchAppointments, refreshAppointments } = useAppointmentStore();

    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const [showReview, setShowReview] = useState(false);

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

    const handleCardPress = (appointment: any) => {
        setSelectedAppointment(appointment);
        setShowDetails(true);
    };

    const handleReschedule = () => {
        setShowDetails(false);
        setIsRescheduleMode(selectedAppointment?.status !== 'Cancelled');
        setTimeout(() => setShowBooking(true), 600);
    };

    const handleWriteReview = () => {
        setShowDetails(false);
        setTimeout(() => setShowReview(true), 600);
    };

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

                {selectedAppointment && (
                    <ReviewModal
                        appointment={selectedAppointment}
                        visible={showReview}
                        onClose={() => setShowReview(false)}
                        onSuccess={onRefresh}
                    />
                )}

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
            </>
        );
    }

    return <HospitalServices setSearchModalVisible={setSearchModalVisible} />;
};

export default function HomeScreen() {
    const { getUpcomingAppointments } = useAppointmentStore();
    const { t } = useTranslation();
    const router = useRouter();
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const upcomingAppointments = getUpcomingAppointments();
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
            <LanguageSelectionModal />
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
                        {
                            user && (
                                <TouchableOpacity
                                    onPress={() => setSearchModalVisible(true)}
                                    className="flex-row items-center gap-3 bg-white rounded-2xl px-5 py-4 mb-5 border"
                                    style={{
                                        elevation: 2,
                                        borderColor: 'rgba(243, 244, 246, 0.5)',
                                        shadowColor: '#000',
                                        shadowOpacity: 0.05,
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowRadius: 2
                                    }}
                                    activeOpacity={0.95}
                                >
                                    <Search color="#3B82F6" size={20} />
                                    <Text className="flex-1 text-gray-400 font-quicksand-medium text-base">
                                        {t("searchDoctor")}
                                    </Text>
                                    <View className="bg-blue-50 p-1.5 rounded-xl">
                                        <Ionicons name="options-outline" size={18} color="#3B82F6" />
                                    </View>
                                </TouchableOpacity>
                            )
                        }

                    </View>
                    {
                        user && upcomingAppointments.length !== 0 ? (
                            <View className="px-4">
                                <AppointmentsSection setSearchModalVisible={setSearchModalVisible} />
                            </View>
                        ) : (
                            <AppointmentsSection setSearchModalVisible={setSearchModalVisible} />
                        )
                    }

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
