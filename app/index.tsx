import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import * as Notifications from 'expo-notifications';
import { Redirect, router } from 'expo-router';
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
    const setupNotifications = async () => {
      const subscriptionReceived = Notifications.addNotificationReceivedListener(notification => {
        console.log('📥 Notification received in foreground:', notification);
      });

      const subscriptionResponse = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 User tapped notification:', response);
        router.push('/appointments');
      });

      return () => {
        subscriptionReceived.remove();
        subscriptionResponse.remove();
      };
    };

    setupNotifications();
  }, [user?.id, fetchUnreadCount]);


  // useEffect(() => {
  //   fetchAuthenticatedUser();
  //   SecureStore.deleteItemAsync("user");
  //   const storeUser = async () => {
  //     try {
  //       await SecureStore.setItemAsync('user', JSON.stringify({
  //         id: "688521fc003e6eeb2343",
  //         name: "Mahmood Iffty",
  //         age: 27,
  //         phone: "01788126796",
  //         createdAt: new Date().toISOString(),
  //       }));
  //       console.log("User stored in SecureStore.");
  //     } catch (e) {
  //       console.error('Error saving user to SecureStore:', e);
  //     }
  //   };

  //   storeUser();
  //   console.log(user);
  // }, []);


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={'/(tabs)'} />;
}
