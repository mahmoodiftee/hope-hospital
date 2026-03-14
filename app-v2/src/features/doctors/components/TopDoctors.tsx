import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Text, TouchableOpacity, View, Alert } from 'react-native';
import { HeaderText } from '@/shared/components';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getTranslatedField } from '@/shared/utils/translation';

// In our new architecture we get the doctor definition from the shared types or define it here
export interface DoctorI {
    id?: string;
    $id?: string;
    name: string;
    name_bn?: string;
    specialty: string;
    specialty_bn?: string;
    image?: string;
    hourlyRate: number;
    experience: string;
    experience_bn?: string;
    specialties: string[];
    specialties_bn?: string[];
}

interface TopDoctorsProps {
    onViewAll?: () => void;
    topDoctors: DoctorI[];
}

export const TopDoctors: React.FC<TopDoctorsProps> = ({ onViewAll, topDoctors }) => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
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
        <View
            className="bg-white"
            style={{
                width: cardWidth,
                marginRight: cardMargin,
                borderRadius: 28,
                padding: 12,
                borderWidth: 1,
                borderColor: '#EBF2FF',
                shadowColor: '#3B82F6',
                shadowOpacity: 0.10,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 6 },
                elevation: 3
            }}
        >
            <View className="relative">
                <Image
                    source={{ uri: topDoctor.image }}
                    className="w-full h-36 rounded-2xl mb-3"
                    resizeMode="cover"
                />
                {/* Rating Overlay */}
                {/* <View className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center gap-1 border border-white/20">
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text className="text-gray-900 font-bold text-[10px]">4.8</Text>
                </View> */}

                {topDoctor.id || topDoctor.$id ? (
                    <TouchableOpacity
                        onPress={() => handleToggleFavorite((topDoctor.id || topDoctor.$id) as string)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
                    >
                        <Ionicons
                            name={dbUser?.favorites?.includes((topDoctor.id || topDoctor.$id) as string) ? "heart" : "heart-outline"}
                            size={16}
                            color={dbUser?.favorites?.includes((topDoctor.id || topDoctor.$id) as string) ? "#FF4D67" : "#9CA3AF"}
                        />
                    </TouchableOpacity>
                ) : null}
            </View>

            <View className="mb-3 px-1">
                <Text className="text-gray-900 font-bold text-sm mb-0.5" numberOfLines={1}>
                    {getTranslatedField(topDoctor, 'name', i18n.language)}
                </Text>
                <Text className="text-blue-500 font-bold text-[11px]" numberOfLines={1}>
                    {getTranslatedField(topDoctor, 'specialty', i18n.language)}
                </Text>
            </View>

            <TouchableOpacity
                className="bg-blue-600 rounded-xl py-2.5 shadow-sm shadow-blue-400"
                onPress={() => handleBookAppointment(topDoctor)}
            >
                <Text className="text-white text-center text-xs font-bold uppercase tracking-wider">
                    {t('book')}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2 mt-0 px-1">
                <HeaderText title={t('topDoctors')} className="mb-0" />
                <TouchableOpacity onPress={onViewAll} className="flex-row items-center">
                    <Text className="text-blue-600 font-bold text-sm">{t('viewAll')}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#2563EB" className="ml-0.5" />
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
                contentContainerStyle={{
                    paddingHorizontal: cardMargin,
                    paddingBottom: 15,
                    paddingTop: 8
                }}
                snapToInterval={cardWidth + cardMargin}
                decelerationRate="fast"
                bounces={false}
                getItemLayout={(data, index) => ({
                    length: cardWidth + cardMargin,
                    offset: (cardWidth + cardMargin) * index,
                    index,
                })}
                style={{ marginHorizontal: -cardMargin }} // Pull back the padding to align with header
                removeClippedSubviews={false} // Prevent shadow clipping
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
