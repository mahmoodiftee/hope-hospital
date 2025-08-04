import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import AppointmentBooking from '@/components/AppointmentBookingComponents/AppointmentBooking';
import useAppwrite from '@/lib/useAppwrite';
import { getDoctor } from '@/lib/appwrite';
import { LoadingSpinner } from '@/components/doctors/LoadingSpinner';
import { DoctorExperience, DoctorInfo, DoctorReviews, DoctorSpecialties } from '@/components/doctors/DoctorDetailSections';
import { ActionButtons } from '@/components/doctors/ActionButtons';

interface RouteParams {
    id: string;
}

const DoctorDetailsScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params as RouteParams;
    const [showBookingModal, setShowBookingModal] = useState(false);

    const { data: doctor, loading } = useAppwrite({
        fn: getDoctor,
        params: { id },
    });

    const handleBookNow = () => setShowBookingModal(true);
    const handleBookingClose = () => setShowBookingModal(false);
    const handleCall = () => console.log('Calling doctor:', doctor?.name);

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 py-4">
                    <Text className="text-xl font-semibold text-dark-100">Doctor Detail</Text>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full justify-center items-center"
                        onPress={() => navigation.goBack()}
                    >
                        <X color="rgba(0,0,0,1)" size={20} />
                    </TouchableOpacity>
                </View>

                <DoctorInfo doctor={doctor} />

                <View className="h-2 bg-gray-50" />
                <DoctorExperience experience={doctor?.experience!} />

                <View className="h-2 bg-gray-50" />
                <DoctorSpecialties specialties={doctor?.specialties!} />

                <View className="h-2 bg-gray-50" />
                <DoctorReviews reviews={doctor?.reviews} />

                <ActionButtons onBookNow={handleBookNow} onCall={handleCall} />

                <View className="h-20" />
            </ScrollView>

            <Modal
                visible={showBookingModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleBookingClose}
            >
                <AppointmentBooking
                    doctor={doctor!}
                    onClose={handleBookingClose}
                />
            </Modal>
        </SafeAreaView>
    );
};

export default DoctorDetailsScreen;