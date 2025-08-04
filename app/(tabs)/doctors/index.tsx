import { router, useLocalSearchParams } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import {
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppointmentBooking from '@/components/AppointmentBookingComponents/AppointmentBooking';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { SkeletonCard } from '@/components/doctors/SkeletonCard';
import Search from '@/components/Search';
import { useDoctorBooking } from '@/hooks/useDoctorBooking';
import { getAllDoctors } from '@/lib/appwrite';
import useAppwrite from '@/lib/useAppwrite';
import { Doctor } from '@/types';

const DoctorsScreen: React.FC = () => {
    const params = useLocalSearchParams<{ query?: string; filter?: string }>();
    const {
        showBookingModal,
        selectedDoctorId,
        handleBookNow,
        handleBookingClose,
    } = useDoctorBooking();

    const {
        data: filteredDoctors,
        refetch,
        loading,
    } = useAppwrite({
        fn: getAllDoctors,
        params: {
            filter: params.filter!,
            query: params.query!,
        },
        skip: true,
    });

    useEffect(() => {
        refetch({
            filter: params.filter!,
            query: params.query!,
        });
    }, [params.filter, params.query]);

    const doctorList: Doctor[] = useMemo(() => {
        if (!filteredDoctors) return [];
        return filteredDoctors.map((doc: any) => ({
            id: doc.$id,
            name: doc.name,
            specialty: doc.specialty,
            hourlyRate: doc.hourlyRate,
            image: doc.image,
            experience: doc.experience,
            specialties: doc.specialties,
            reviews: doc.reviews,
        }));
    }, [filteredDoctors]);

    const selectedDoctor = doctorList.find((d) => d.id === selectedDoctorId);

    const handleViewDetails = (doctorId: string) => {
        router.push({
            pathname: '/doctors/[id]',
            params: { id: doctorId },
        });
    };

    const renderDoctorCard = ({ item }: { item: Doctor }) => (
        <DoctorCard
            doctor={item}
            onBookNow={() => handleBookNow(item.id)}
            onViewDetails={() => handleViewDetails(item.id)}
            onCall={() => console.log('Call:', item.id)}
        />
    );

    const renderSkeletonCard = () => <SkeletonCard />;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="mx-4 pt-1">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-dark-100 text-3xl font-bold pl-1">Doctors</Text>
                    <TouchableOpacity
                        className="border-2 border-gray-200/10 rounded-full p-1 mr-1.5"
                        onPress={() => router.push("/(tabs)/notifications" as any)}
                    >
                        <Bell color="rgba(0,0,0,0.8)" size={20} />
                    </TouchableOpacity>
                </View>
                <Search />
            </View>

            {
                loading ? (
                    <FlatList
                        data={Array.from({ length: 4 })}
                        renderItem={renderSkeletonCard}
                        keyExtractor={(_, index) => `skeleton-${index}`}
                        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
                    />
                ) : doctorList.length === 0 ? (
                    <View className="items-center justify-center mt-10">
                        <Text className="text-gray-400">No doctors found.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={doctorList}
                        renderItem={renderDoctorCard}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    />
                )
            }

            <Modal
                visible={showBookingModal && !!selectedDoctor}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleBookingClose}
            >
                {selectedDoctor && (
                    <AppointmentBooking
                        doctor={selectedDoctor}
                        onClose={handleBookingClose}
                    />
                )}
            </Modal>
        </SafeAreaView >
    );
};

export default DoctorsScreen;