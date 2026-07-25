import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View, Dimensions } from "react-native";

const CARD_CONFIG = { width: Dimensions.get('window').width * 0.85, margin: 16 };

export const EmptyAppointmentCard = () => (
    <TouchableOpacity
        onPress={() => router.push("/doctors")}
        className="bg-gray-50 rounded-2xl p-6 items-center justify-center border-2 border-dashed border-gray-200"
        style={{ width: CARD_CONFIG.width }}
    >
        <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="calendar-outline" color="#3b82f6" size={28} />
        </View>
        <Text className="text-gray-900 font-semibold text-lg mb-2">
            No upcoming appointments
        </Text>
        <Text className="text-gray-500 text-center text-sm mb-4">
            Book your next consultation with our qualified doctors
        </Text>
        <View className="bg-blue-500 px-6 py-3 rounded-xl">
            <Text className="text-white font-medium">Find Doctors</Text>
        </View>
    </TouchableOpacity>
);
