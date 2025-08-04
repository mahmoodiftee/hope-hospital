import useAuthStore from '@/store/auth.store';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
// 
export default function Index() {
  const { user, fetchAuthenticatedUser, isLoading } = useAuthStore();
  // const {
  //   fetchUnreadCount,
  // } = useNotificationStore();
  // useEffect(() => {
  //   fetchAuthenticatedUser();
  //   if (user?.id) {
  //     fetchUnreadCount(user.id);
  //   }
  //   const setupNotifications = async () => {
  //     const subscriptionReceived = Notifications.addNotificationReceivedListener(notification => {
  //       console.log('📥 Notification received in foreground:', notification);
  //     });

  //     const subscriptionResponse = Notifications.addNotificationResponseReceivedListener(response => {
  //       console.log('👆 User tapped notification:', response);
  //       router.push('/appointments');
  //     });

  //     return () => {
  //       subscriptionReceived.remove();
  //       subscriptionResponse.remove();
  //     };
  //   };

  //   setupNotifications();
  // }, [user?.id, fetchUnreadCount]);


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={'/(tabs)'} />;
}
