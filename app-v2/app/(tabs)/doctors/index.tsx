import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useDoctorStore, DoctorCard, useDoctorSearch, useDoctorFilters } from '@/features/doctors';
import { translateSpecialty } from '@/shared/utils/specialtyUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth';
import { getTypographyStyle } from '@/shared/utils/typography';

export default function DoctorsListingScreen() {
    const { t } = useTranslation();
    const { fetchDoctors, isLoading } = useDoctorStore();
    const { searchQuery, search, filteredDoctors: searchFilteredDoctors } = useDoctorSearch();
    const { specialties, selectedSpecialty, toggleSpecialty, filteredDoctors } = useDoctorFilters(searchFilteredDoctors);
    const { dbUser, toggleFavorite, isAuthenticated } = useAuth();

    const handleToggleFavorite = (doctorId: string) => {
        if (!isAuthenticated) {
            Alert.alert(
                t("doctors.loginRequired"),
                t("doctors.saveDoctorLoginHint"),
                [
                    { text: t("doctors.cancel"), style: "cancel" },
                    { text: t("doctors.login"), onPress: () => router.push('/(auth)/sign-in') }
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
                <Text
                    className="text-[26px] text-center py-1 text-gray-900 mb-4 px-1"
                    style={getTypographyStyle('black', 26)}
                >
                    {t("doctors.findYourDoctor")}
                </Text>

                {/* Search Bar */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F1F5F9',
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 0,
                    marginBottom: 20,
                    height: 52,
                }}>
                    <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                    <AppTextInput
                        placeholder={t("doctors.searchPrompt")}
                        value={searchQuery}
                        onChangeText={search}
                        containerStyle={{ flex: 1, height: 52, backgroundColor: 'transparent', paddingHorizontal: 0 }}
                        style={[getTypographyStyle('bold', 15), { fontSize: 15, color: '#0F172A', backgroundColor: 'transparent' }]}
                        placeholderTextColor="#94A3B8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => search('')}>
                            <Ionicons name="close-circle" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Chips */}
                <View className="flex-row mb-3">
                    <FlatList
                        data={[
                            { label: t('doctors.all'), value: '' },
                            ...specialties.map(s => ({
                                label: translateSpecialty(s, t),
                                value: s
                            }))
                        ]}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.value || 'all'}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => toggleSpecialty(item.value)}
                                className={`px-6 py-3 rounded-full mr-3 ${(item.value === '' && !selectedSpecialty) || selectedSpecialty === item.value
                                    ? 'bg-blue-500 '
                                    : 'bg-gray-100'
                                    }`}
                            >
                                <Text style={getTypographyStyle('bold', 14)} className={`font-quicksand-bold ${(item.value === '' && !selectedSpecialty) || selectedSpecialty === item.value
                                    ? 'text-white'
                                    : 'text-gray-500'
                                    }`}>
                                    {item.label}
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
                                <Text
                                    className="text-gray-400 mt-4"
                                    style={getTypographyStyle('bold', 16)}
                                >
                                    {t("doctors.noDoctorsFound")}
                                </Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
