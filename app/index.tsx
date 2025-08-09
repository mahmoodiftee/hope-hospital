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

  // Native Notify hook - this handles all the registration automatically
  registerNNPushToken(31591, 'CFKdEHY835MXsOap4DerLI');

  useEffect(() => {
    // Initialize everything when app starts
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');

        // 1. Setup basic notifications (permissions + tokens)
        console.log('🔔 Setting up basic notifications...');
        await setupBasicNotifications();

        // 2. Fetch authenticated user
        console.log('👤 Fetching authenticated user...');
        await fetchAuthenticatedUser();

        console.log('✅ App initialization completed');
      } catch (error) {
        console.error('❌ App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Verify Native Notify registration when user is available
    const verifyRegistration = async () => {
      if (user?.id || dbUser?.$id) {
        const userId = user?.id || dbUser?.$id;
        console.log('🔍 Checking Native Notify registration for user:', userId);
        
        // Wait a bit for the hook to complete registration
        setTimeout(async () => {
          await verifyNativeNotifyRegistration(userId);
        }, 3000);
      }
    };

    verifyRegistration();
  }, [user?.id, dbUser?.$id]);

  useEffect(() => {
    // Fetch unread count when user is available
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