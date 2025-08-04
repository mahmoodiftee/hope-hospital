import React, { useState } from "react";
import { View, TouchableOpacity, Image, TextInput, Text, Modal, FlatList } from "react-native";
import { useDebouncedCallback } from "use-debounce";
import { images } from "@/constants";
import { useLocalSearchParams, router } from "expo-router";
import { X, Search as SearchIcon, ChevronDown, Check, Funnel } from 'lucide-react-native';

const SPECIALTIES = [
    { id: "all", label: "All", value: "" },
    { id: "General Medicine", label: "General Medicine", value: "General Medicine" },
    { id: "Dental", label: "Dentist", value: "Dental" },
    { id: "Heart", label: "Heart", value: "Heart" },
    { id: "liver", label: "Liver", value: "liver" },
    { id: "lungs", label: "Lungs", value: "lungs" },
    { id: "kidney", label: "Kidney", value: "kidney" },
];

const Search = () => {
    const params = useLocalSearchParams<{ query?: string; filter?: string }>();
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
        <View className="pb-2">

            <View className="flex-row items-center w-full gap-2 px-1">
                {/* Search Bar */}
                <View className="flex-row items-center flex-1 bg-white border border-black/10 rounded-xl px-4 py-2 shadow-sm">
                    <SearchIcon color="black" size={20} style={{ opacity: 0.8 }} />
                    <TextInput
                        value={search}
                        onChangeText={handleSearch}
                        placeholder="Find a doctor or filter by speciality"
                        returnKeyType="search"
                        onSubmitEditing={() => debouncedSearch(search ?? "")}
                        className="ml-2 flex-1 text-sm text-black font-quicksand-medium"
                        placeholderTextColor="#888"
                    />
                    {search?.length > 0 && (
                        <TouchableOpacity onPress={handleClear} className="ml-1">
                            <X color="black" size={20} style={{ opacity: 0.8 }} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Button */}
                <View className="flex-row items-center bg-white border border-black/10 rounded-xl p-[17px] shadow-sm">

                    <TouchableOpacity
                        onPress={() => setShowFilterDropdown(true)}
                        className=""
                    >
                        <Funnel color="black" size={18} style={{ opacity: 0.8 }} strokeWidth={2} />
                    </TouchableOpacity>
                </View>
            </View>


            {selectedFilter.id !== "all" && (
                <View className="flex-row items-center mt-2 px-2">
                    <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                        <Text className="text-blue text-sm font-medium">
                            {selectedFilter.label}
                        </Text>
                        <TouchableOpacity
                            onPress={() => handleFilterSelect(SPECIALTIES[0])}
                            className="ml-2"
                        >
                            <X color="rgba(59, 130, 246, 1)" size={14} />
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
                        className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-lg"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text className="text-center text-lg font-semibold text-dark-100 mb-3">
                            Choose a Specialty
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
                                    <Text className="text-dark-100 text-base">
                                        {item.label}
                                    </Text>
                                    {selectedFilter.id === item.id && (
                                        <Check color="#007AFF" size={20} />
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

export default Search;