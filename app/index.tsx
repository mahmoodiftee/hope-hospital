import useAuthStore from '@/store/auth.store';
import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';


export default function Index() {
  const { fetchAuthenticatedUser, isLoading } = useAuthStore();
  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={'/(tabs)'} />;
}
