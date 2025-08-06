import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';


export default function Index() {
  const { user, fetchAuthenticatedUser, isLoading } = useAuthStore();
  const {
    fetchUnreadCount,
  } = useNotificationStore();
  useEffect(() => {
    fetchAuthenticatedUser();
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
