import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth';
import { useDoctorStore, DoctorCard } from '@/features/doctors';
import { Doctor } from '@/shared/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackHeader } from '@/shared/components/BackHeader';

export default function SavedDoctorsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { dbUser, toggleFavorite, isAuthenticated } = useAuth();
    const { fetchDoctors, doctors, isLoading } = useDoctorStore();
    const [savedDoctors, setSavedDoctors] = useState<Doctor[]>([]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    useEffect(() => {
        if (dbUser?.favorites && doctors.length > 0) {
            const filtered = doctors.filter(doc => dbUser.favorites?.includes(doc.id));
            setSavedDoctors(filtered);
        } else {
            setSavedDoctors([]);
        }
    }, [dbUser?.favorites, doctors]);

    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <Text className="text-xl font-bold text-gray-900 mb-2">{t('savedDoctors.loginRequired')}</Text>
                <Text className="text-gray-500 font-medium text-center mb-8">
                    {t('savedDoctors.loginHint')}
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/sign-in')}
                    className="w-full h-14 bg-blue-500 rounded-2xl items-center justify-center"
                >
                    <Text className="text-white font-bold text-lg">{t('savedDoctors.goLogin')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['bottom', 'left', 'right']}>
            <BackHeader title={t('savedDoctors.title')} />

            <View className="flex-1 px-5 pt-4">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                ) : (
                    <FlatList
                        data={savedDoctors}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <DoctorCard
                                doctor={item}
                                onPress={() => router.push(`/(tabs)/doctors/${item.id}` as any)}
                                isFavorite={true}
                                onToggleFavorite={() => toggleFavorite(item.id)}
                            />
                        )}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center pt-20">
                                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="heart-outline" size={40} color="#9CA3AF" />
                                </View>
                                <Text className="text-gray-500 font-bold text-lg">{t('savedDoctors.noSaved')}</Text>
                                <Text className="text-gray-400 font-medium text-center px-10 mt-2">
                                    {t('savedDoctors.noSavedSub')}
                                </Text>
                            </View>
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
