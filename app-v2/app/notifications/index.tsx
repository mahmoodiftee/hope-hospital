import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth';
import { useNotificationStore, NotificationItem } from '@/features/notifications';

export default function NotificationsScreen() {
    const { t } = useTranslation();
    const { dbUser } = useAuth();
    const { notifications, isLoading, isLoadingMore, hasMore, fetchNotifications, loadMoreNotifications, markAsRead } = useNotificationStore();

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

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{
                title: t('notifications.title'),
                headerTitleStyle: { fontFamily: 'Quicksand-Bold', fontSize: 20 },
                headerShadowVisible: false,
                headerLeft: () => null, // Hide back button if it's a tab child
            }} />

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
                                onPress={() => markAsRead(item.$id!)}
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
        </SafeAreaView>
    );
}
