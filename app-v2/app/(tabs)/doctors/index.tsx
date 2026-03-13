import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDoctorStore, DoctorCard, useDoctorSearch, useDoctorFilters } from '@/features/doctors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth';

export default function DoctorsListingScreen() {
    const { fetchDoctors, isLoading } = useDoctorStore();
    const { searchQuery, search, filteredDoctors: searchFilteredDoctors } = useDoctorSearch();
    const { specialties, selectedSpecialty, toggleSpecialty, filteredDoctors } = useDoctorFilters(searchFilteredDoctors);
    const { dbUser, toggleFavorite, isAuthenticated } = useAuth();

    const handleToggleFavorite = (doctorId: string) => {
        if (!isAuthenticated) {
            Alert.alert(
                "Login Required",
                "Please login to save doctors to your favorites.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => router.push('/(auth)/sign-in') }
                ]
            );
            return;
        }
        toggleFavorite(doctorId);
    };

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="px-5 pt-4 pb-2">
                <Text className="text-3xl font-quicksand-bold text-gray-900 mb-6">Find Your Doctor</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl gap-2 px-4 py-3 mb-6">
                    <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                    <AppTextInput
                        placeholder="Search doctor by name or specialty..."
                        value={searchQuery}
                        onChangeText={search}
                        containerStyle={{ flex: 1, height: 40 }}
                        style={{ fontSize: 16 }}
                    />
                </View>

                {/* Filter Chips */}
                <View className="flex-row mb-6">
                    <FlatList
                        data={['All', ...specialties]}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => item === 'All' ? toggleSpecialty('') : toggleSpecialty(item)}
                                className={`px-6 py-3 rounded-full mr-3 ${(item === 'All' && !selectedSpecialty) || selectedSpecialty === item
                                    ? 'bg-blue-500 '
                                    : 'bg-gray-100'
                                    }`}
                            >
                                <Text className={`font-quicksand-bold ${(item === 'All' && !selectedSpecialty) || selectedSpecialty === item
                                    ? 'text-white'
                                    : 'text-gray-500'
                                    }`}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>

            <View className="flex-1">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredDoctors}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <DoctorCard
                                doctor={item}
                                onPress={() => router.push(`/(tabs)/doctors/${item.id}` as any)}
                                isFavorite={dbUser?.favorites?.includes(item.id)}
                                onToggleFavorite={() => handleToggleFavorite(item.id)}
                            />
                        )}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center pt-20">
                                <Ionicons name="search" size={60} color="#E5E7EB" />
                                <Text className="text-gray-400 font-quicksand-bold mt-4">No doctors found</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
