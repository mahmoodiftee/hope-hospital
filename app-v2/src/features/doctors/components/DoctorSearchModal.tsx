import { router, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, FlatList, Keyboard, Modal, Platform, StatusBar, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Search } from './Search';
import { useDoctorStore } from '../stores/doctor.store';
import { useDoctorSearch } from '../hooks/useDoctorSearch';
import { Doctor } from '@/shared/types';
import { useAuth } from '@/features/auth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.95;
const skeletons = Array.from({ length: 4 });

interface DoctorSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onDoctorSelect?: (doctor: Doctor) => void;
}

export const DoctorSearchModal: React.FC<DoctorSearchModalProps> = ({
    visible,
    onClose,
    onDoctorSelect,
}) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const opacity = useSharedValue(0);
    const { dbUser, toggleFavorite, isAuthenticated } = useAuth();

    const params = useGlobalSearchParams<{ query?: string; filter?: string }>();

    const { fetchDoctors, isLoading } = useDoctorSearch();
    const filteredDoctors = useDoctorStore((state) => state.filteredDoctors);

    useEffect(() => {
        if (visible) {
            fetchDoctors();
            translateY.value = withSpring(SCREEN_HEIGHT - MODAL_HEIGHT, {
                damping: 18,
                stiffness: 150,
                mass: 0.8
            });
            opacity.value = withTiming(1, { duration: 250 });
        }
    }, [visible, fetchDoctors]);

    const handleClose = () => {
        Keyboard.dismiss();
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
            runOnJS(onClose)();
        });
        opacity.value = withTiming(0, { duration: 200 });
    };

    const panGesture = Gesture.Pan()
        .onChange((event) => {
            const newValue = translateY.value + event.changeY;
            if (newValue > SCREEN_HEIGHT - MODAL_HEIGHT) {
                translateY.value = newValue;
            }
        })
        .onEnd((event) => {
            if (event.velocityY > 500 || translateY.value > SCREEN_HEIGHT - MODAL_HEIGHT + 150) {
                runOnJS(handleClose)();
            } else {
                translateY.value = withSpring(SCREEN_HEIGHT - MODAL_HEIGHT, {
                    damping: 18,
                    stiffness: 150,
                    mass: 0.8
                });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const doctorList: Doctor[] = useMemo(() => {
        if (!filteredDoctors) return [];
        let list = [...filteredDoctors];

        if (params.query) {
            const lowerQuery = params.query.toLowerCase();
            list = list.filter(d =>
                d.name.toLowerCase().includes(lowerQuery) ||
                d.specialty.toLowerCase().includes(lowerQuery)
            );
        }

        if (params.filter) {
            const lowerFilter = params.filter.toLowerCase();
            list = list.filter(d =>
                d.specialty.toLowerCase() === lowerFilter ||
                (d.specialties && d.specialties.some(s => s.toLowerCase() === lowerFilter))
            );
        }

        return list;
    }, [filteredDoctors, params.query, params.filter]);

    const renderDoctorCard = ({ item }: { item: Doctor }) => {
        const handleDoctorPress = () => {
            handleClose();
            setTimeout(() => {
                router.push({
                    pathname: '/doctors/[id]',
                    params: { id: item.id },
                });
            }, 350);
            onDoctorSelect?.(item);
        };

        const handleToggleFavorite = () => {
            if (!isAuthenticated) {
                Alert.alert(
                    "Login Required",
                    "Please login to save doctors to your favorites.",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Login", onPress: () => {
                                handleClose();
                                router.push('/(auth)/sign-in');
                            }
                        }
                    ]
                );
                return;
            }
            toggleFavorite(item.id);
        };

        return (
            <View className='bg-white rounded-[24px] p-2.5 mb-4 mx-4 border border-gray-100' style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
                <View className="flex-row gap-4 items-center justify-start mb-3">
                    <View className="w-24 h-32 relative">
                        <Image
                            source={{ uri: item.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d" }}
                            className="w-full h-full rounded-2xl"
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            onPress={handleToggleFavorite}
                            className="absolute top-1.5 right-1.5 w-8 h-8 bg-black/30 rounded-full items-center justify-center border border-white/20"
                        >
                            <Ionicons
                                name={dbUser?.favorites?.includes(item.id) ? "heart" : "heart-outline"}
                                size={18}
                                color={dbUser?.favorites?.includes(item.id) ? "#FF4D67" : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 py-1">
                        <Text className="text-xl font-bold text-gray-900 mb-1">{item.name}</Text>
                        <View className="flex-row gap-1.5 items-center mb-1">
                            <Ionicons name="medkit" size={14} color="#3B82F6" />
                            <Text className="text-gray-600 font-medium">{item.specialty}</Text>
                        </View>
                        <View className="flex-row gap-1.5 items-center">
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text className="text-gray-900 font-bold">4.8</Text>
                            <Text className="text-gray-400 text-xs">(120 reviews)</Text>
                        </View>
                        <View className="mt-2 bg-blue-50 self-start px-2 py-1 rounded-lg">
                            <Text className="text-blue-600 font-bold text-xs">৳{item.hourlyRate}/hr</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        className="bg-blue-600 flex-1 py-3 rounded-xl"
                        onPress={handleDoctorPress}
                    >
                        <Text className="text-center font-bold text-white">View Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                        <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderSkeletonCard = () => (
        <View className='bg-white rounded-[24px] p-2.5 mb-4 mx-4 border border-gray-100'>
            <View className="flex-row gap-4 items-center mb-3">
                <View className="w-24 h-32 rounded-2xl bg-gray-100" />
                <View className="flex-1 py-1">
                    <View className="w-32 h-6 rounded-lg bg-gray-100 mb-2" />
                    <View className="w-24 h-4 rounded-lg bg-gray-100 mb-2" />
                    <View className="w-20 h-4 rounded-lg bg-gray-100" />
                </View>
            </View>
            <View className="flex-row gap-2">
                <View className="flex-1 h-12 bg-gray-100 rounded-xl" />
                <View className="w-12 h-12 bg-gray-100 rounded-xl" />
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="none"
            presentationStyle="overFullScreen"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View className="flex-1">
                <Animated.View
                    className="absolute inset-0 bg-black/40"
                    style={backdropStyle}
                >
                    <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose} />
                </Animated.View>

                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        className="absolute left-0 right-0 bottom-0 bg-gray-50 rounded-t-[32px]"
                        style={[
                            { height: MODAL_HEIGHT, elevation: 24, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: -4 } },
                            animatedStyle
                        ]}
                    >
                        {/* Drag Handle */}
                        <View className="items-center py-4">
                            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </View>

                        {/* Search Section */}
                        <View className="px-5 mb-5">
                            <View className="flex-row items-center justify-between mb-4">
                                <View>
                                    <Text className="text-2xl font-bold text-gray-900">Find Your Doctor</Text>
                                    <Text className="text-gray-500 text-sm">Select from our expert panel</Text>
                                </View>
                                <TouchableOpacity
                                    className="bg-gray-100 h-10 w-10 rounded-full items-center justify-center"
                                    onPress={handleClose}
                                >
                                    <Ionicons name="close" color="#4B5563" size={24} />
                                </TouchableOpacity>
                            </View>
                            <Search />
                        </View>

                        {/* List Section */}
                        <View className="flex-1">
                            {isLoading ? (
                                <FlatList
                                    data={skeletons}
                                    renderItem={renderSkeletonCard}
                                    keyExtractor={(_, index) => `skeleton-${index}`}
                                    contentContainerStyle={{ paddingBottom: 100 }}
                                />
                            ) : doctorList.length === 0 ? (
                                <View className="items-center justify-center mt-20 px-10">
                                    <View className="bg-gray-100 p-6 rounded-full mb-4">
                                        <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                                    </View>
                                    <Text className="text-gray-900 text-lg font-bold text-center">No Doctors Found</Text>
                                    <Text className="text-gray-500 text-center mt-2">
                                        Try searching with a different name or specialty.
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={doctorList}
                                    renderItem={renderDoctorCard}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={{ paddingBottom: 100 }}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                />
                            )}
                        </View>
                    </Animated.View>
                </GestureDetector>
            </View>
        </Modal>
    );
};
