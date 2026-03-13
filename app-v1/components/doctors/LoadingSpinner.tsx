import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoadingSpinner: React.FC = () => (
    <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#3B82F6" />
        </View>
    </SafeAreaView>
);