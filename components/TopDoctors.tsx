import React, { useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity, Dimensions, Text, Image, Modal } from 'react-native';
import HeaderText from './HeaderText';
import AppointmentBooking from './AppointmentBookingComponents/AppointmentBooking';

interface DoctorI {
    $id?: string;
    name: string;
    specialty: string;
    hourlyRate: number;
    image: string;
    experience: string;
    specialties: string[];
}

interface TopDoctorsProps {
    onViewAll?: () => void;
    topDoctors: DoctorI[];
}

const TopDoctors: React.FC<TopDoctorsProps> = ({ onViewAll, topDoctors }) => {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorI | null>(null);

    const screenWidth = Dimensions.get('window').width;
    const cardMargin = 16;
    const cardWidth = (screenWidth - (cardMargin * 3)) / 2;

    const onScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / (cardWidth + cardMargin));
        setCurrentIndex(newIndex);
    };

    const onDotPress = (index: number) => {
        setCurrentIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const handleBookAppointment = (doctor: DoctorI) => {
        setSelectedDoctor(doctor);
        setShowBookingModal(true);
    };

    const handleBookingClose = () => {
        setShowBookingModal(false);
        setSelectedDoctor(null);
    };

    const renderTopDoctorCard = ({ item: topDoctor }: { item: DoctorI }) => (
        <View className="bg-gray-50 shadow-sm rounded-2xl p-3 mb-2" style={{ width: cardWidth, marginRight: cardMargin }}>
            <Image
                source={{ uri: topDoctor.image }}
                className="w-full h-32 rounded-lg mb-3"
                resizeMode="cover"
            />
            <Text className="text-dark-100 font-medium text-sm" numberOfLines={1}>
                {topDoctor.name}
            </Text>
            <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>
                {topDoctor.specialty}
            </Text>

            <TouchableOpacity
                className="bg-blue/90 rounded-md py-1.5"
                onPress={() => handleBookAppointment(topDoctor)}
            >
                <Text className="text-white text-center text-xs font-semibold">
                    Book Appointment
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <View className="mb-2">
                <View className="flex-row items-center justify-between mb-2">
                    <HeaderText title="Top Doctors" />
                    <TouchableOpacity onPress={onViewAll}>
                        <Text className="text-blue font-quicksand-medium">View All</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={topDoctors}
                    renderItem={renderTopDoctorCard}
                    keyExtractor={(item) => item.$id!}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={{ paddingHorizontal: 0 }}
                    snapToInterval={cardWidth + cardMargin}
                    decelerationRate="fast"
                    bounces={false}
                    getItemLayout={(data, index) => ({
                        length: cardWidth + cardMargin,
                        offset: (cardWidth + cardMargin) * index,
                        index,
                    })}
                />

                <View className="flex-row justify-center mt-4 gap-2">
                    {Array.from({ length: Math.ceil(topDoctors.length / 2) }, (_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => onDotPress(index * 2)}
                            className={`w-2 h-2 rounded-full ${Math.floor(currentIndex / 2) === index ? 'bg-blue-500' : 'bg-gray-300'}`}
                        />
                    ))}
                </View>
            </View>

            {/* Appointment Booking Modal */}
            <Modal
                visible={showBookingModal && !!selectedDoctor}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleBookingClose}
            >
                {selectedDoctor && (
                    <AppointmentBooking
                        doctor={{
                            id: selectedDoctor.$id || '',
                            name: selectedDoctor.name,
                            specialty: selectedDoctor.specialty,
                            hourlyRate: selectedDoctor.hourlyRate,
                            image: selectedDoctor.image,
                            experience: selectedDoctor.experience,
                            specialties: selectedDoctor.specialties
                        }}
                        onClose={handleBookingClose}
                    />
                )}
            </Modal>
        </>
    );
};

export default TopDoctors;