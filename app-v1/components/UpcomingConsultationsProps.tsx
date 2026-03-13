import { images } from "@/constants";
import { CARD_CONFIG } from '@/utils/constants';
import { transformAppointmentToDoctorType } from '@/utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react-native';
import React, { useRef } from 'react';
import { FlatList, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import EmptyAppointmentCard from './EmptyAppointmentCard';
import HeaderText from './HeaderText';
import SkeletonCard from './SkeletonCard';

type DoctorType = {
    id: number;
    name: string;
    specialization: string;
    image: string;
    location: string;
    time: string;
    bgColor: string;
};

interface Appointment {
    $id: string;
    $createdAt: string;
    patientName: string;
    patientPhone: string;
    appointmentDateTime: string;
    status: string;
    doctorId?: {
        image?: string;
        name?: string;
        specialty?: string;
    };
    doctorName?: string;
    doctorImage?: string;
    doctorSpecialty?: string;
    location?: string;
    notes?: string;
    doctor_name?: string;
    specialty?: string;
}

interface UpcomingConsultationsProps {
    upcomingAppointments: Appointment[];
    loading?: boolean;
}

const UpcomingConsultations = ({ upcomingAppointments, loading = false }: UpcomingConsultationsProps) => {
    const flatListRef = useRef<FlatList<DoctorType>>(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const doctors: DoctorType[] = upcomingAppointments.map(transformAppointmentToDoctorType);

    const onScroll = (event: any) => {
        const slideSize = CARD_CONFIG.width + CARD_CONFIG.margin;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setCurrentIndex(index);
    };

    const onDotPress = (index: number) => {
        setCurrentIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const renderDoctorCard = ({ item: doctor }: { item: DoctorType }) => (
        <View style={{ width: CARD_CONFIG.width, marginRight: CARD_CONFIG.margin }}>
            <View className={`${doctor.bgColor} rounded-2xl p-4 relative overflow-hidden`}>
                <ImageBackground
                    source={images.texture}
                    resizeMode="cover"
                    className="absolute inset-0 opacity-10"
                />

                <View className="flex-row items-center relative z-10">
                    <Image
                        source={{ uri: doctor.image }}
                        className="w-12 h-12 rounded-full mr-3"
                    />
                    <View className="flex-1">
                        <Text className="text-white font-bold text-lg font-quicksand-semibold">
                            {doctor.name}
                        </Text>
                        <Text className="text-blue-100 font-medium text-sm">
                            {doctor.specialization}
                        </Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-end mt-4 z-10">
                    <View className="flex-1">
                        <LinearGradient
                            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)']}
                            start={{ x: 1, y: 0.5 }}
                            end={{ x: 0, y: 0.5 }}
                            style={{ padding: 8, borderRadius: 50 }}
                        >
                            <View className="flex-row items-center gap-3">
                                <MapPin className="" color="white" size={20} />
                                <Text className="text-gray-50 font-bold text-sm -mb-.5">
                                    {doctor.location}
                                </Text>
                            </View>
                        </LinearGradient>

                        <LinearGradient
                            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)']}
                            start={{ x: 1, y: 0.5 }}
                            end={{ x: 0, y: 0.5 }}
                            style={{ marginTop: 8, padding: 8, borderRadius: 50 }}
                        >
                            <View className="flex-row items-center gap-3">
                                <Clock className="" color="white" size={18} />
                                <Text className="text-gray-50 font-bold text-sm -mb-.5">
                                    {doctor.time}
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    <View className="flex-row items-center mb-1 gap-3">
                        <TouchableOpacity
                            className="bg-[rgba(255,255,255,0.3)] w-10 h-10 rounded-full items-center justify-center"
                        >
                            <Phone color="white" size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-[rgba(255,255,255,0.3)] w-10 h-10 rounded-full items-center justify-center"
                        >
                            <MessageCircle color="white" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className="mb-2">
                <HeaderText title="Upcoming Consultation" />
                <FlatList
                    data={[1, 2]}
                    renderItem={() => <SkeletonCard />}
                    keyExtractor={(item, index) => `skeleton-${index}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 0 }}
                    scrollEnabled={false}
                />
                <View className="flex-row justify-center mt-4 gap-2">
                    <View className="w-2 h-2 rounded-full bg-gray-300" />
                    <View className="w-2 h-2 rounded-full bg-gray-300" />
                </View>
            </View>
        );
    }

    if (!upcomingAppointments || upcomingAppointments.length === 0) {
        return (
            <View className="mb-2">
                <HeaderText title="Upcoming Consultation" />
                <EmptyAppointmentCard />
            </View>
        );
    }

    return (
        <View className="mb-2">
            <HeaderText title="Upcoming Consultation" />

            <FlatList
                ref={flatListRef}
                data={doctors}
                renderItem={renderDoctorCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingHorizontal: 0 }}
                snapToInterval={CARD_CONFIG.width + CARD_CONFIG.margin}
                decelerationRate="fast"
                bounces={false}
                getItemLayout={(data, index) => ({
                    length: CARD_CONFIG.width + CARD_CONFIG.margin,
                    offset: (CARD_CONFIG.width + CARD_CONFIG.margin) * index,
                    index,
                })}
            />

            <View className="flex-row justify-center mt-4 gap-2">
                {doctors.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => onDotPress(index)}
                        className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
                    />
                ))}
            </View>
        </View>
    );
};

export default UpcomingConsultations;