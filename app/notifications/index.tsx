import EmptyNotifications from '@/components/Notification/EmptyNotifications';
import NotificationHeader from '@/components/Notification/NotificationHeader';
import NotificationItem from '@/components/Notification/NotificationItem';
import NotificationModal from '@/components/Notification/NotificationModal';
import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import { Notification } from '@/types/notification';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, RefreshControl, ScrollView, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function Notifications() {
    const { user, fetchAuthenticatedUser } = useAuthStore();
    const {
        notifications,
        unreadCount,
        loading,
        refreshing,
        setRefreshing,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification: deleteNotificationFromStore,
        deleteAllNotifications,
    } = useNotificationStore();

    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const modalScale = useRef(new Animated.Value(0)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!user) {
            fetchAuthenticatedUser();
        }
    }, [user, fetchAuthenticatedUser]);

    useEffect(() => {
        if (user?.id) {
            fetchNotifications(user.id);
        }
    }, [user?.id, fetchNotifications]);

    const onRefresh = useCallback(async () => {
        if (!user?.id) return;
        try {
            setRefreshing(true);
            await fetchNotifications(user.id);
        } catch (error) {
            toast.error('Failed to refresh notifications', error as any);
        } finally {
            setRefreshing(false);
        }
    }, [user?.id, fetchNotifications, setRefreshing]);

    const openModal = (notification: Notification) => {
        setSelectedNotification(notification);
        setModalVisible(true);

        Animated.parallel([
            Animated.spring(modalScale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }),
            Animated.timing(modalOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.spring(modalScale, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }),
            Animated.timing(modalOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setModalVisible(false);
            setSelectedNotification(null);
        });
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.id) return;
        try {
            await markAllAsRead(user.id);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => console.log('Deletion cancelled'),
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteNotificationFromStore(notificationId);
                            toast.success('Notification deleted');
                        } catch (error: any) {
                            toast.error('Failed to delete notification',error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleDeleteAll = async () => {
        if (!user?.id || notifications.length === 0) return;

        Alert.alert(
            'Delete All Notifications',
            'Are you sure you want to delete all notifications?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => console.log('Bulk deletion cancelled'),
                },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAllNotifications(user.id);
                            toast.success('All notifications deleted successfully');
                        } catch (error: any) {
                            console.error('Delete all error:', error);
                            toast.error('Failed to delete all notifications',error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text className="text-gray-500 text-lg">Loading notifications...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 px-4">
            <NotificationHeader
                unreadCount={unreadCount}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteAll={handleDeleteAll}
                hasNotifications={notifications.length > 0}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {notifications.length === 0 ? (
                    <EmptyNotifications />
                ) : (
                    <View className="pt-4">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.$id}
                                notification={notification}
                                onPress={openModal}
                                onMarkAsRead={handleMarkAsRead}
                                onDelete={handleDeleteNotification}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            <NotificationModal
                notification={selectedNotification}
                visible={modalVisible}
                onClose={closeModal}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
                modalScale={modalScale}
                modalOpacity={modalOpacity}
            />
        </SafeAreaView>
    );
}