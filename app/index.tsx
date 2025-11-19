import { registerForPushNotificationsAsync, registerPushTokenWithBackend } from '@/lib/notifications';
import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import * as Notifications from 'expo-notifications';
import { Redirect } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, dbUser, fetchAuthenticatedUser, isLoading } = useAuthStore();
  const { fetchUnreadCount } = useNotificationStore();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await fetchAuthenticatedUser();

        const expoPushToken = await registerForPushNotificationsAsync();

        if (expoPushToken && (user?.id || dbUser?.$id)) {
          const userId = user?.id || dbUser?.$id;

          await registerPushTokenWithBackend(userId!, expoPushToken);
          console.log('App initialization complete');
        }
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      console.log(data);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  useEffect(() => {
    const reRegisterToken = async () => {
      if (user?.id || dbUser?.$id) {
        const userId = user?.id || dbUser?.$id;

        try {
          const expoPushToken = await registerForPushNotificationsAsync();
          if (expoPushToken) {
            await registerPushTokenWithBackend(userId!, expoPushToken);
          }
        } catch (error) {
          console.error('❌ Error re-registering token:', error);
        }
      }
    };

    reRegisterToken();
  }, [user?.id, dbUser?.$id]);

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount(user.id);
    }
  }, [user?.id, fetchUnreadCount]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={'/(tabs)'} />;
}