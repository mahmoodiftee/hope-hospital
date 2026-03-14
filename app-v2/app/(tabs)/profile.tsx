import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/features/auth';
import { PersonalInfoForm, SettingsItem } from '@/features/profile';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppointmentStore } from '@/features/appointments/stores/appointment.store';
import { useNotificationStore } from '@/features/notifications';
import { parseAppointmentDateTime } from '@/shared/utils/timeUtils';
import { User as UserIcon, Phone, ChevronRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, dbUser, logout, isAuthenticated, initializeAuth } = useAuth();
    const { appointments, fetchAppointments, refreshAppointments } = useAppointmentStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const [refreshing, setRefreshing] = React.useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (isAuthenticated && (user?.phone || dbUser?.phone)) {
            fetchAppointments({ phone: user?.phone || dbUser?.phone });
        }
        if (isAuthenticated && dbUser?.$id) {
            fetchNotifications(dbUser.$id);
        }
    }, [isAuthenticated, user?.phone, dbUser?.phone, dbUser?.$id]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            const phone = user?.phone || dbUser?.phone;
            const userId = dbUser?.$id;
            await Promise.all([
                initializeAuth(),
                refreshAppointments({ phone }),
                userId ? fetchNotifications(userId) : Promise.resolve()
            ]);
        } finally {
            setRefreshing(false);
        }
    }, [user?.phone, dbUser?.phone, initializeAuth, refreshAppointments]);

    const stats = useMemo(() => {
        if (!isAuthenticated) return { visits: 0, upcoming: 0 };

        const now = new Date();
        const upcoming = appointments.filter(a => {
            if (a.status === 'Cancelled') return false;
            const dt = parseAppointmentDateTime(a.date, a.time);
            return dt > now;
        }).length;

        const visits = appointments.filter(a => {
            if (a.status === 'Cancelled') return false;
            const dt = parseAppointmentDateTime(a.date, a.time);
            return dt <= now;
        }).length;

        return { visits, upcoming };
    }, [appointments, isAuthenticated]);

    const handleLogout = () => {
        Alert.alert(
            t("profile.logoutTitle"),
            t("profile.logoutConfirm"),
            [
                { text: t("profile.cancel"), style: "cancel" },
                { text: t("profile.logout"), style: "destructive", onPress: logout }
            ]
        );
    };

    const handleLogin = () => {
        router.push('/(auth)/sign-in');
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="px-6 my-16">
                        {/* Welcome Card */}
                        <View
                            className="bg-white rounded-[40px] p-10 mb-6"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.05,
                                shadowRadius: 20,
                                elevation: 5
                            }}
                        >
                            <View className="items-center">
                                <View className="w-24 h-24 rounded-[32px] mb-8 items-center justify-center bg-blue-50">
                                    <UserIcon size={40} color="#3B82F6" strokeWidth={1.5} />
                                </View>

                                <Text className="text-gray-900 text-2xl font-bold mb-3 text-center">{t("profile.hopeHospital")}</Text>
                                <Text className="text-gray-500 text-base font-medium text-center mb-10 leading-6 px-2">{t("profile.loginRequirement")}</Text>

                                <TouchableOpacity
                                    onPress={handleLogin}
                                    className="w-full bg-blue-500 rounded-[24px] py-5 mb-2 shadow-lg shadow-blue-200"
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white text-center font-bold text-lg">{t("profile.signInRegister")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Emergency Card */}
                        <TouchableOpacity
                            className="bg-white rounded-[32px] p-6 border border-red-50"
                            style={{
                                shadowColor: "#EF4444",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.03,
                                shadowRadius: 12,
                                elevation: 2
                            }}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4 bg-red-50">
                                        <Phone size={22} color="#EF4444" strokeWidth={2} />
                                    </View>
                                    <View>
                                        <Text className="text-gray-900 font-bold text-base">{t("profile.emergencyAssistance")}</Text>
                                        <Text className="text-red-500 font-bold text-sm">{t("profile.call911")}</Text>
                                    </View>
                                </View>
                                <ChevronRight size={18} color="#D1D5DB" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.replace('/(tabs)')}
                            className="mt-10 py-2 items-center"
                        >
                            <Text className="text-gray-400 font-bold text-sm tracking-wider">{t("profile.guestDashboard")}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

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
                <View className="mt-8">
                    <PersonalInfoForm
                        name={dbUser?.name || 'User'}
                        phone={user?.phone || dbUser?.phone || ''}
                        onEditPress={() => { router.push('/edit-profile' as any) }}
                    />
                </View>
                {/* Quick Stats Tiles */}
                <View className="flex-row px-4 mt-6 gap-4">
                    <TouchableOpacity
                        className="flex-1 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm/10 items-center"
                        onPress={() => router.push({ pathname: '/appointments', params: { filter: 'Completed' } })}
                        activeOpacity={0.7}
                    >
                        <View className="w-10 h-10 bg-green-50 rounded-2xl items-center justify-center mb-3">
                            <MaterialCommunityIcons name="calendar-check" size={20} color="#10B981" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{stats.visits}</Text>
                        <Text className="text-gray-400 font-medium text-xs mt-1">{t("profile.totalVisits")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm/10 items-center"
                        onPress={() => router.push({ pathname: '/appointments', params: { filter: 'Upcoming' } })}
                        activeOpacity={0.7}
                    >
                        <View className="w-10 h-10 bg-blue-50 rounded-2xl items-center justify-center mb-3">
                            <MaterialCommunityIcons name="calendar-clock" size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{stats.upcoming}</Text>
                        <Text className="text-gray-400 font-medium text-xs mt-1">{t("profile.upcoming")}</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <View className="px-4 mt-8">
                    <Text className="text-gray-900 font-bold text-lg mb-4 ml-2">{t("profile.personalSettings")}</Text>
                    <View className="bg-white rounded-[32px] px-4 py-2 border border-gray-100 shadow-sm/10/10">
                        <SettingsItem
                            icon="calendar"
                            title={t("profile.myAppointments")}
                            subtitle={t("profile.myAppointmentsSub")}
                            onPress={() => router.push('/appointments' as any)}
                        />
                        <View className="h-[1px] bg-gray-50 mx-4" />
                        <SettingsItem
                            icon="heart"
                            title={t("profile.savedDoctors")}
                            subtitle={t("profile.savedDoctorsSub")}
                            onPress={() => router.push('/saved-doctors')}
                        />
                        <View className="h-[1px] bg-gray-50 mx-4" />
                        <SettingsItem
                            icon="notifications"
                            title={t("profile.notifications")}
                            subtitle={unreadCount > 0 ? t('profile.notificationsUnread', { count: unreadCount }) : t("profile.notificationsNone")}
                            onPress={() => router.push('/notifications')}
                            badgeCount={unreadCount}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <View className="px-4 mt-8">
                    <Text className="text-gray-900 font-bold text-lg mb-4 ml-2">{t("profile.supportSafety")}</Text>
                    <View className="bg-white rounded-[32px] px-4 py-2 border border-gray-100 shadow-sm/10">
                        <SettingsItem
                            icon="help-circle"
                            title={t("profile.helpCenter")}
                            subtitle={t("profile.helpCenterSub")}
                            onPress={() => { }}
                        />
                        <View className="h-[1px] bg-gray-50 mx-4" />
                        <SettingsItem
                            icon="shield-checkmark"
                            title={t("profile.privacySecurity")}
                            subtitle={t("profile.privacySecuritySub")}
                            onPress={() => { }}
                        />
                        <View className="h-[1px] bg-gray-50 mx-4" />
                        <SettingsItem
                            icon="settings"
                            title={t("profile.appSettings")}
                            subtitle={t("profile.appSettingsSub")}
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <View className="px-4 mt-8 mb-20">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center justify-center py-5 bg-red-50 rounded-[32px] border border-red-100"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="log-out" size={20} color="#EF4444" />
                        <Text className="ml-2 text-red-500 font-bold text-base">{t("profile.signOut")}</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-gray-300 font-medium text-xs mt-6">
                        {t("profile.appVersion")}
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView >
    );
}
