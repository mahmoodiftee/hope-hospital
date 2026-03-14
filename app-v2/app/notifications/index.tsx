import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth';
import { useNotificationStore, NotificationItem } from '@/features/notifications';
import { getTranslatedField } from '@/shared/utils/translation';
import { Notification } from '@/shared/types';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BackHeader } from '@/shared/components/BackHeader';

export default function NotificationsScreen() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { dbUser } = useAuth();
    const { notifications, isLoading, isLoadingMore, hasMore, fetchNotifications, loadMoreNotifications, markAsRead } = useNotificationStore();
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    useEffect(() => {
        if (dbUser?.$id) {
            fetchNotifications(dbUser.$id, true);
        }
    }, [dbUser]);

    // Mark all currently visible as read when screen is focused
    useEffect(() => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.$id!);
        if (unreadIds.length > 0) {
            // We want to avoid infinite loops if markAsRead triggers re-renders
            // But markAsRead handles state updates correctly
            unreadIds.forEach(id => markAsRead(id));
        }
    }, [notifications]);

    const getColours = (type: string) => {
        switch (type) {
            case 'appointment_confirmation':
                return { color: '#22C55E', iconBg: '#F0FDF4', icon: 'checkmark-circle' as const };
            case 'appointment_reminder':
                return { color: '#FBBF24', iconBg: '#FFFBEB', icon: 'alarm' as const };
            case 'appointment_cancelled':
                return { color: '#EF4444', iconBg: '#FEF2F2', icon: 'close-circle' as const };
            case 'appointment_rescheduled':
                return { color: '#6366F1', iconBg: '#EEF2FF', icon: 'calendar' as const };
            default:
                return { color: '#6366F1', iconBg: '#EEF2FF', icon: 'calendar' as const };
        }
    };


    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom', 'left', 'right']}>
            <BackHeader title={t('notifications.title')} />

            <View className="flex-1">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.$id!}
                        onRefresh={() => dbUser?.$id && fetchNotifications(dbUser.$id, true)}
                        refreshing={isLoading}
                        onEndReached={() => dbUser?.$id && loadMoreNotifications(dbUser.$id)}
                        onEndReachedThreshold={0.5}
                        renderItem={({ item }) => (
                            <NotificationItem
                                notification={item}
                                onPress={() => {
                                    markAsRead(item.$id!);
                                    setSelectedNotification(item);
                                }}
                            />
                        )}
                        ListFooterComponent={() => (
                            isLoadingMore ? (
                                <View className="py-6 items-center">
                                    <ActivityIndicator size="small" color="#3B82F6" />
                                </View>
                            ) : hasMore && notifications.length > 0 ? (
                                <View className="h-20" />
                            ) : null
                        )}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center pt-20">
                                <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="notifications-off-outline" size={40} color="#9CA3AF" />
                                </View>
                                <Text className="text-gray-500 font-bold text-lg">{t('notifications.noNotifications')}</Text>
                                <Text className="text-gray-400 font-medium text-center px-10 mt-2">
                                    {t('notifications.noNotificationsSub')}
                                </Text>
                            </View>
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
                    />
                )}
            </View>


            <Modal
                transparent
                visible={!!selectedNotification}
                animationType="none"
                statusBarTranslucent
                onRequestClose={() => setSelectedNotification(null)}
            >
                {selectedNotification && (() => {
                    const { color, icon, iconBg } = getColours(selectedNotification.type);
                    return (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            {/* Backdrop */}
                            <Animated.View
                                entering={FadeIn.duration(200)}
                                exiting={FadeOut.duration(180)}
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
                            >
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelectedNotification(null)} activeOpacity={1} />
                            </Animated.View>

                            {/* Card */}
                            <Animated.View
                                entering={FadeIn.duration(280).springify()}
                                exiting={FadeOut.duration(180)}
                                style={{
                                    width: '88%',
                                    maxHeight: '72%',
                                    backgroundColor: '#fff',
                                    borderRadius: 28,
                                    overflow: 'hidden',
                                    elevation: 24,
                                    shadowColor: color,
                                    shadowOffset: { width: 0, height: 12 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 24,
                                }}
                            >
                                {/* Header */}
                                <View style={{ padding: 22, paddingBottom: 16 }}>
                                    {/* Close button */}
                                    <TouchableOpacity
                                        onPress={() => setSelectedNotification(null)}
                                        style={{
                                            position: 'absolute', top: 16, right: 16,
                                            width: 32, height: 32, borderRadius: 16,
                                            backgroundColor: '#F3F4F6',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <Ionicons name="close" size={16} color="#6B7280" />
                                    </TouchableOpacity>

                                    {/* Icon badge */}
                                    <View style={{
                                        width: 44, height: 44, borderRadius: 14,
                                        backgroundColor: iconBg,
                                        alignItems: 'center', justifyContent: 'center',
                                        marginBottom: 14,
                                    }}>
                                        <Ionicons name={icon} size={22} color={color} />
                                    </View>

                                    {/* Title */}
                                    <Text style={{
                                        fontSize: 18,
                                        fontFamily: 'Quicksand-Bold',
                                        color: '#111827',
                                        lineHeight: 26,
                                        paddingRight: 32,
                                    }}>
                                        {getTranslatedField(selectedNotification, 'title', i18n.language)}
                                    </Text>

                                    {/* Timestamp */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
                                        <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                                        <Text style={{ fontSize: 11, fontFamily: 'Quicksand-Medium', color: '#9CA3AF', letterSpacing: 0.3 }}>
                                            {new Date(selectedNotification.$createdAt!).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Text>
                                    </View>
                                </View>

                                {/* Divider */}
                                <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 22 }} />

                                {/* Message body */}
                                <ScrollView
                                    style={{ paddingHorizontal: 22, paddingTop: 16 }}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    bounces={false}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Text style={{
                                        fontSize: 14,
                                        fontFamily: 'Quicksand-Medium',
                                        color: '#4B5563',
                                        lineHeight: 24,
                                    }}>
                                        {getTranslatedField(selectedNotification, 'message', i18n.language)}
                                    </Text>
                                </ScrollView>

                                {/* Footer button */}
                                <View style={{ padding: 20, paddingTop: 12 }}>
                                    <TouchableOpacity
                                        onPress={() => setSelectedNotification(null)}
                                        activeOpacity={0.85}
                                        style={{
                                            backgroundColor: color,
                                            paddingVertical: 14,
                                            borderRadius: 16,
                                            alignItems: 'center',
                                            shadowColor: color,
                                            shadowOffset: { width: 0, height: 6 },
                                            shadowOpacity: 0.35,
                                            shadowRadius: 12,
                                            elevation: 8,
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontFamily: 'Quicksand-Bold', fontSize: 15 }}>
                                            {t('appointments.success.done')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </View>
                    );
                })()}
            </Modal>

        </SafeAreaView>
    );
}
