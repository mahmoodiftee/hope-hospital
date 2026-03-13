import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
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
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: logout }
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

                                <Text className="text-gray-900 text-2xl font-quicksand-bold mb-3 text-center">Hope Hospital</Text>
                                <Text className="text-gray-500 text-base font-quicksand-medium text-center mb-10 leading-6 px-2"> Sign in to access your appointments, medical history, and more.</Text>

                                <TouchableOpacity
                                    onPress={handleLogin}
                                    className="w-full bg-blue-500 rounded-[24px] py-5 mb-2 shadow-lg shadow-blue-200"
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white text-center font-quicksand-bold text-lg">Sign In / Register</Text>
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
                                        <Text className="text-gray-900 font-quicksand-bold text-base">Emergency Assistance</Text>
                                        <Text className="text-red-500 font-quicksand-bold text-sm">Call 911</Text>
                                    </View>
                                </View>
                                <ChevronRight size={18} color="#D1D5DB" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.replace('/(tabs)')}
                            className="mt-10 py-2 items-center"
                        >
                            <Text className="text-gray-400 font-quicksand-bold text-sm tracking-wider">VISIT DASHBOARD AS GUEST</Text>
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
                        <Text className="text-2xl font-quicksand-bold text-gray-900">{stats.visits}</Text>
                        <Text className="text-gray-400 font-quicksand-medium text-xs mt-1">Total Visits</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm/10 items-center"
                        onPress={() => router.push({ pathname: '/appointments', params: { filter: 'Upcoming' } })}
                        activeOpacity={0.7}
                    >
                        <View className="w-10 h-10 bg-blue-50 rounded-2xl items-center justify-center mb-3">
                            <MaterialCommunityIcons name="calendar-clock" size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-2xl font-quicksand-bold text-gray-900">{stats.upcoming}</Text>
                        <Text className="text-gray-400 font-quicksand-medium text-xs mt-1">Upcoming</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <View className="px-4 mt-8">
                    <Text className="text-gray-900 font-quicksand-bold text-lg mb-4 ml-2">Personal Settings</Text>
                    <View className="bg-white rounded-[32px] px-4 py-2 border border-gray-100 shadow-sm/10/10">
                        <SettingsItem
                            icon="calendar"
                            title="My Appointments"
                            subtitle="View and manage your bookings"
                            onPress={() => router.push('/appointments' as any)}
                        />
                        <View className="h-[1px] bg-gray-50 mx-4" />
                        <SettingsItem
                            icon="heart"
                            title="Saved Doctors"
                            subtitle="Quick access to your favorites"
                            onPress={() => router.push('/saved-doctors')}
                        />
                        <View className="h-[1px] bg-gray-50 mx-4" />
                        <SettingsItem
                            icon="notifications"
                            title="Notifications"
                            subtitle={unreadCount > 0 ? `${unreadCount} unread notifications` : "No unread notifications"}
                            onPress={() => router.push('/notifications')}
                            badgeCount={unreadCount}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <View className="px-4 mt-8">
                    <Text className="text-gray-900 font-quicksand-bold text-lg mb-4 ml-2">Support & Safety</Text>
                    <View className="bg-white rounded-[32px] px-4 py-2 border border-gray-100 shadow-sm/10">
                        <SettingsItem
                            icon="help-circle"
                            title="Help Center"
                            subtitle="FAQs and contact support"
                            onPress={() => { }}
                        />
                        <View className="h-[1px] bg-gray-50 mx-4" />
                        <SettingsItem
                            icon="shield-checkmark"
                            title="Privacy & Security"
                            subtitle="Manage your health data"
                            onPress={() => { }}
                        />
                        <View className="h-[1px] bg-gray-50 mx-4" />
                        <SettingsItem
                            icon="settings"
                            title="App Settings"
                            subtitle="Preferences and region"
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
                        <Text className="ml-2 text-red-500 font-quicksand-bold text-base">Sign Out</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-gray-300 font-quicksand-medium text-xs mt-6">
                        Hope Hospital • Version 2.1.0
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView >
    );
}
