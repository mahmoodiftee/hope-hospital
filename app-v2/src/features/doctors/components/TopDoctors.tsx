import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Text, TouchableOpacity, View, Alert } from 'react-native';
import { HeaderText } from '@/shared/components';
import { router } from 'expo-router';
import { useAuth } from '@/features/auth';
import { Ionicons } from '@expo/vector-icons';

// In our new architecture we get the doctor definition from the shared types or define it here
export interface DoctorI {
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

export const TopDoctors: React.FC<TopDoctorsProps> = ({ onViewAll, topDoctors }) => {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { dbUser, toggleFavorite, isAuthenticated } = useAuth();

    const screenWidth = Dimensions.get('window').width;
    const cardMargin = 16;
    const cardWidth = (screenWidth - (cardMargin * 3)) / 2;

    const onScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / (cardWidth + cardMargin));
        setCurrentIndex(newIndex);
    };

    const handleBookAppointment = (doctor: DoctorI) => {
        // Direct to doctors detail page where booking happens
        router.push(`/doctors/${doctor.$id}` as any);
    };

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

    const renderTopDoctorCard = ({ item: topDoctor }: { item: DoctorI }) => (
        <View className="bg-gray-50 rounded-2xl p-3 mb-2" style={{ width: cardWidth, marginRight: cardMargin, elevation: 1.5, shadowColor: '#000', shadowOpacity: 0.09, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}>
            <Image
                source={{ uri: topDoctor.image }}
                className="w-full h-32 rounded-lg mb-3"
                resizeMode="cover"
            />
            <View className="flex-row justify-between items-start mb-1">
                <View className="flex-1 mr-2">
                    <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        {topDoctor.name}
                    </Text>
                    <Text className="text-gray-500 text-xs" numberOfLines={1}>
                        {topDoctor.specialty}
                    </Text>
                </View>
                {topDoctor.$id && (
                    <TouchableOpacity
                        onPress={() => handleToggleFavorite(topDoctor.$id!)}
                        className="p-1 -mt-1 -mr-1"
                    >
                        <Ionicons
                            name={dbUser?.favorites?.includes(topDoctor.$id) ? "heart" : "heart-outline"}
                            size={18}
                            color={dbUser?.favorites?.includes(topDoctor.$id) ? "#FF4D67" : "#9CA3AF"}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                className="bg-blue-600 rounded-md py-2"
                onPress={() => handleBookAppointment(topDoctor)}
            >
                <Text className="text-white text-center text-xs font-bold">
                    Book
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="mb-5">
            <View className="flex-row items-center justify-between mb-4 mt-2">
                <HeaderText title="Top Doctors" />
                <TouchableOpacity onPress={onViewAll}>
                    <Text className="text-blue-600 font-bold">View All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={topDoctors}
                renderItem={renderTopDoctorCard}
                keyExtractor={(item, index) => item.$id || index.toString()}
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
                    <View
                        key={index}
                        className={`w-2 h-2 rounded-full ${Math.floor(currentIndex / 2) === index ? 'bg-blue-600' : 'bg-gray-200'}`}
                    />
                ))}
            </View>
        </View>
    );
};
