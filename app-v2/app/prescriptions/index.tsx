import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrescriptionCard, usePrescriptions, Prescription } from '@/features/prescriptions';

export default function PrescriptionsScreen() {
    const { t } = useTranslation();
    const { prescriptions, isLoading, error, fetchPrescriptions } = usePrescriptions();

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);

    const handleViewPress = (item: Prescription) => {
        import('sonner-native').then(({ toast }) => {
            toast.info(t('records.comingSoon', { type: item.type }));
        });
    };

    const handleDownloadPress = (item: Prescription) => {
        import('sonner-native').then(({ toast }) => {
            toast.success(t('records.downloadStarted', { type: item.type }));
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-3 p-2 -ml-2 rounded-full active:bg-gray-100"
                >
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">{t('records.title')}</Text>
            </View>

            <View className="flex-1 px-4 pt-4">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text className="text-gray-500 mt-4">{t('records.loading')}</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center">
                        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                        <Text className="text-red-500 mt-4 text-center">{error}</Text>
                        <TouchableOpacity
                            className="mt-6 bg-blue-500 px-6 py-2 rounded-full"
                            onPress={fetchPrescriptions}
                        >
                            <Text className="text-white font-medium">{t('records.tryAgain')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : prescriptions.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                            <Ionicons name="document-text-outline" size={40} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 text-lg font-bold mb-2">{t('records.noRecords')}</Text>
                        <Text className="text-gray-500 text-center px-8">
                            {t('records.noRecordsSub')}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={prescriptions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <PrescriptionCard
                                prescription={item}
                                onViewPress={handleViewPress}
                                onDownloadPress={handleDownloadPress}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
