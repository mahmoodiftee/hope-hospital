import { router, useGlobalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { AppTextInput } from "@/shared/components/AppTextInput";
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from "use-debounce";

const SPECIALTIES = [
    { id: "all", label: "All", value: "" },
    { id: "General Medicine", label: "General Medicine", value: "General Medicine" },
    { id: "Dental", label: "Dentist", value: "Dental" },
    { id: "Heart", label: "Heart", value: "Heart" },
    { id: "liver", label: "Liver", value: "liver" },
    { id: "lungs", label: "Lungs", value: "lungs" },
    { id: "kidney", label: "Kidney", value: "kidney" },
];

// Move translating labels inside component or use keys in label and t() in render


export const Search = () => {
    const { t } = useTranslation();
    const params = useGlobalSearchParams<{ query?: string; filter?: string }>();
    const [search, setSearch] = useState(params.query ?? "");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(
        SPECIALTIES.find(s => s.value === params.filter) || SPECIALTIES[0]
    );

    const debouncedSearch = useDebouncedCallback((text: string) => {
        router.setParams({ query: text });
    }, 500);

    const handleSearch = (text: string) => {
        setSearch(text);
        debouncedSearch(text);
    };

    const handleClear = () => {
        setSearch("");
        router.setParams({ query: "" });
    };

    const handleFilterSelect = (specialty: typeof SPECIALTIES[0]) => {
        setSelectedFilter(specialty);
        setShowFilterDropdown(false);

        // Update the filter parameter in the URL
        router.setParams({
            filter: specialty.value,
            query: search // Keep existing search query
        });
    };

    return (
        <View className="pb-3">

            <View className="flex-row items-center w-full gap-2 px-1">
                {/* Search Bar */}
                <View className="flex-row items-center flex-1 bg-gray-100/50 border-2 border-gray-200/50 rounded-2xl px-4 py-3">
                    <Ionicons name="search" color="#6B7280" size={20} />
                    <AppTextInput
                        value={search}
                        onChangeText={handleSearch}
                        placeholder={t('doctors.searchPlaceholder')}
                        containerStyle={{ flex: 1, height: 30 }}
                        style={{ fontSize: 15, marginLeft: 8 }}
                        placeholderTextColor="#9CA3AF"
                    />
                    {search?.length > 0 && (
                        <TouchableOpacity onPress={handleClear} className="ml-1">
                            <Ionicons name="close-circle" color="#9CA3AF" size={20} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Button */}
                <TouchableOpacity
                    onPress={() => setShowFilterDropdown(true)}
                    className="bg-gray-100/50 border-2 border-gray-200/50 rounded-2xl p-3"
                >
                    <Ionicons name="options-outline" color="#3B82F6" size={20} />
                </TouchableOpacity>
            </View>


            {selectedFilter.id !== "all" && (
                <View className="flex-row items-center mt-2 px-2">
                    <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                        <Text className="text-blue-600 text-sm font-medium">
                            {t(`doctors.specialties.${selectedFilter.id.toLowerCase().replace(/\s+/g, '')}`) || selectedFilter.label}
                        </Text>
                        <TouchableOpacity
                            onPress={() => handleFilterSelect(SPECIALTIES[0])}
                            className="ml-2"
                        >
                            <Ionicons name="close" color="rgba(37, 99, 235, 1)" size={14} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <Modal
                visible={showFilterDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFilterDropdown(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/40 justify-center items-center px-4"
                    activeOpacity={1}
                    onPress={() => setShowFilterDropdown(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        className="w-full max-w-sm bg-white rounded-2xl p-4"
                        style={{ elevation: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text className="text-center text-lg font-semibold text-gray-900 mb-3">
                            {t('doctors.chooseSpecialty')}
                        </Text>

                        <FlatList
                            data={SPECIALTIES}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleFilterSelect(item)}
                                    className={`px-4 py-3 rounded-xl mb-2 ${selectedFilter.id === item.id
                                        ? "bg-blue-50"
                                        : "bg-white"
                                        } flex-row items-center justify-between`}
                                >
                                    <Text className="text-gray-900 text-base">
                                        {item.id === 'all' ? t('doctors.all') : t(`doctors.specialties.${item.id.toLowerCase().replace(/\s+/g, '')}`)}
                                    </Text>
                                    {selectedFilter.id === item.id && (
                                        <Ionicons name="checkmark" color="#007AFF" size={20} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

        </View>
    );
};
