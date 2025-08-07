import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import axios from 'axios';
import { Redirect } from 'expo-router';
import registerNNPushToken from 'native-notify';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, fetchAuthenticatedUser, isLoading } = useAuthStore();

  registerNNPushToken(31591, 'CFKdEHY835MXsOap4DerLI');

  const { fetchUnreadCount } = useNotificationStore();

  const APP_ID = 31591;
  const APP_TOKEN = 'CFKdEHY835MXsOap4DerLI';
  
  useEffect(() => {
    axios
      .get(`https://app.nativenotify.com/api/expo/indie/subs/${APP_ID}/${APP_TOKEN}`)
      .then((res) => console.log('✅ Registered users:', res.data))
      .catch((err) => console.error('❌ Failed to fetch registered users:', err));
  
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
