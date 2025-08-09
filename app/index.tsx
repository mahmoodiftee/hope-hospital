// index.tsx - Simplified approach - let Native Notify hook handle everything
import { setupBasicNotifications, verifyNativeNotifyRegistration } from '@/lib/notifications';
import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import { Redirect } from 'expo-router';
import registerNNPushToken from 'native-notify';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, dbUser, fetchAuthenticatedUser, isLoading } = useAuthStore();
  const { fetchUnreadCount } = useNotificationStore();

  registerNNPushToken(31591, 'CFKdEHY835MXsOap4DerLI');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await setupBasicNotifications();
        await fetchAuthenticatedUser();
      } catch (error) {
        console.error('❌ App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const verifyRegistration = async () => {
      if (user?.id || dbUser?.$id) {
        const userId = user?.id || dbUser?.$id;
        setTimeout(async () => {
          await verifyNativeNotifyRegistration(userId);
        }, 3000);
      }
    };

    verifyRegistration();
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