import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching prescription data
        setTimeout(() => {
            setPrescriptions([
                {
                    id: 'rx001',
                    date: '2023-11-15',
                    doctor: 'Dr. Sarah Rahman',
                    specialty: 'Cardiologist',
                    medications: [
                        {
                            name: 'Atorvastatin',
                            dosage: '40mg',
                            frequency: 'Once daily at bedtime',
                            duration: '30 days',
                            instructions: 'Take with water. Avoid grapefruit.'
                        },
                        {
                            name: 'Metoprolol',
                            dosage: '25mg',
                            frequency: 'Twice daily',
                            duration: '30 days',
                            instructions: 'Take with food.'
                        }
                    ],
                    refills: 3,
                    pharmacy: 'City Health Pharmacy'
                },
                {
                    id: 'rx002',
                    date: '2023-10-28',
                    doctor: 'Dr. Michael Chen',
                    specialty: 'General Physician',
                    medications: [
                        {
                            name: 'Amoxicillin',
                            dosage: '500mg',
                            frequency: 'Three times daily',
                            duration: '7 days',
                            instructions: 'Take until finished, even if symptoms improve'
                        }
                    ],
                    refills: 0,
                    pharmacy: 'Wellness Central Pharmacy'
                },
                {
                    id: 'rx003',
                    date: '2023-09-10',
                    doctor: 'Dr. Emily Johnson',
                    specialty: 'Dermatologist',
                    medications: [
                        {
                            name: 'Doxycycline',
                            dosage: '100mg',
                            frequency: 'Twice daily',
                            duration: '14 days',
                            instructions: 'Take with full glass of water, avoid sunlight'
                        },
                        {
                            name: 'Clindamycin Lotion',
                            dosage: '1%',
                            frequency: 'Apply twice daily',
                            duration: '30 days',
                            instructions: 'Apply to affected areas after washing'
                        }
                    ],
                    refills: 1,
                    pharmacy: 'Skin Care Specialty Pharmacy'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getSpecialtyIcon = (specialty: string) => {
        switch (specialty.toLowerCase()) {
            case 'cardiologist':
                return 'heart';
            case 'dermatologist':
                return 'flower';
            case 'general physician':
                return 'medical';
            default:
                return 'person';
        }
    };

    const getSpecialtyColors = (specialty: string) => {
        switch (specialty.toLowerCase()) {
            case 'cardiologist':
                return { bg: 'bg-red-50', text: 'text-red-600', icon: '#EF4444' };
            case 'dermatologist':
                return { bg: 'bg-purple-50', text: 'text-purple-600', icon: '#8B5CF6' };
            case 'general physician':
                return { bg: 'bg-blue-50', text: 'text-blue-600', icon: '#3B82F6' };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-600', icon: '#6B7280' };
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4">
                {/* Header */}
                <View className="flex-row items-center justify-between py-3">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mr-4 p-2 rounded-full bg-white shadow-sm"
                        >
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-gray-900">
                            My Prescriptions
                        </Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: 30
                }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text className="mt-4 text-gray-500 text-base">
                            Loading prescriptions...
                        </Text>
                    </View>
                ) : prescriptions.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-6">
                            <Ionicons name="reader-outline" size={48} color="#007AFF" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 mb-3">
                            No Prescriptions
                        </Text>
                        <Text className="text-gray-500 text-center px-8 text-lg leading-6">
                            Your active prescriptions will appear here
                        </Text>
                    </View>
                ) : (
                    <View className="gap-4 p-4 pb-32">
                        {prescriptions.map((prescription) => {
                            const specialtyColors = getSpecialtyColors(prescription.specialty);
                            return (
                                <View
                                    key={prescription.id}
                                    className="bg-white rounded-2xl p-3 shadow-lg"
                                >
                                    {/* Header Section */}
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-1">
                                            <View className="flex-row items-center mb-1.5">
                                                <View className={`w-10 h-10 ${specialtyColors.bg} rounded-full items-center justify-center mr-3`}>
                                                    <Ionicons
                                                        name={getSpecialtyIcon(prescription.specialty)}
                                                        size={20}
                                                        color={specialtyColors.icon}
                                                    />
                                                </View>
                                                <View>
                                                    <Text className="text-lg font-bold text-gray-900">
                                                        {prescription.doctor}
                                                    </Text>
                                                    <Text className="text-sm text-gray-500 mt-0.5">
                                                        {prescription.specialty}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View className="bg-gray-50 px-3 py-1.5 rounded-xl">
                                            <Text className="text-xs text-gray-600 font-medium">
                                                {formatDate(prescription.date)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Medications Section */}
                                    <View className="bg-gray-50 rounded-2xl p-2 mb-4">
                                        <View className="flex-row items-center mb-3">
                                            <Ionicons name="medical" size={18} color="#059669" />
                                            <Text className="text-base font-semibold text-gray-900 ml-2">
                                                Medications ({prescription.medications.length})
                                            </Text>
                                        </View>
                                        {prescription.medications.map((med: any, index: number) => (
                                            <View
                                                key={index}
                                                className={`bg-white rounded-xl p-3.5 border-l-4 border-emerald-500 ${index < prescription.medications.length - 1 ? 'mb-2' : ''
                                                    }`}
                                            >
                                                <View className="flex-row justify-between items-start mb-1.5 px-2">
                                                    <Text className="text-base font-semibold text-gray-900 flex-1">
                                                        {med.name}
                                                    </Text>
                                                    <View className="bg-emerald-50 py-1 rounded-lg px-2">
                                                        <Text className="text-xs text-emerald-600 font-medium">
                                                            {med.dosage}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text className="text-sm text-gray-600 mb-1 px-2">
                                                    {med.frequency} • {med.duration}
                                                </Text>
                                                {/* {med.instructions && (
                                                    <View className="bg-amber-50 px-2.5 py-1.5 rounded-lg mt-1.5">
                                                        <Text className="text-xs text-amber-700 italic">
                                                            ⚠️ {med.instructions}
                                                        </Text>
                                                    </View>
                                                )} */}
                                            </View>
                                        ))}
                                    </View>

                                    {/* Footer Section */}
                                    <View className="flex-1 flex-row justify-between items-center px-2">
                                        <View className="">
                                            <View className="flex-row items-center mb-1 gap-1">
                                                <Ionicons name="storefront" size={16} color="#6B7280" />
                                                <Text className="text-sm text-gray-600 ml-1.5">
                                                    {prescription.pharmacy}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="">
                                            <View className="flex-row items-center">
                                                <Ionicons name="refresh" size={16} color="#6B7280" />
                                                <Text className="text-sm text-gray-600 ml-1.5">
                                                    {prescription.refills} refills remaining
                                                </Text>
                                            </View>
                                        </View>
                                        {/* <TouchableOpacity
                                            className={`px-5 py-2.5 rounded-xl flex-row items-center ${prescription.refills > 0
                                                ? 'bg-blue-500'
                                                : 'bg-gray-200'
                                                }`}
                                            disabled={prescription.refills === 0}
                                        >
                                            <Ionicons
                                                name="refresh"
                                                size={16}
                                                color={prescription.refills > 0 ? 'white' : '#9CA3AF'}
                                            />
                                            <Text className={`text-sm font-semibold ml-1.5 ${prescription.refills > 0
                                                ? 'text-white'
                                                : 'text-gray-500'
                                                }`}>
                                                {prescription.refills > 0 ? 'Refill' : 'No Refills'}
                                            </Text>
                                        </TouchableOpacity> */}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}