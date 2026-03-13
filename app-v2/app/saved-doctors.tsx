import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth';
import { useDoctorStore, DoctorCard } from '@/features/doctors';
import { Doctor } from '@/shared/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SavedDoctorsScreen() {
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
                <Text className="text-xl font-bold text-gray-900 mb-2">Login Required</Text>
                <Text className="text-gray-500 font-medium text-center mb-8">
                    Please login to see your saved doctors.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/sign-in')}
                    className="w-full h-14 bg-blue-500 rounded-2xl items-center justify-center"
                >
                    <Text className="text-white font-bold text-lg">Go to Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
            <Stack.Screen
                options={{
                    title: 'Saved Doctors',
                    headerTitleStyle: { fontFamily: 'Quicksand-Bold', fontSize: 20 },
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#F9FAFB' },
                }}
            />

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
                                <Text className="text-gray-500 font-bold text-lg">No saved doctors</Text>
                                <Text className="text-gray-400 font-medium text-center px-10 mt-2">
                                    Tap the heart icon on a doctor's profile to save them here.
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
