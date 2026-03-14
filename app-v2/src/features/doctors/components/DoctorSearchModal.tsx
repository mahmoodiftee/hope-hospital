import { useRouter, useGlobalSearchParams } from 'expo-router';
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
import { useTranslation } from 'react-i18next';

import { DoctorCard } from './DoctorCard';

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
    const { t } = useTranslation();
    const router = useRouter();
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
                    t("doctors.loginRequired"),
                    t("doctors.saveDoctorLoginHint"),
                    [
                        { text: t("doctors.cancel"), style: "cancel" },
                        {
                            text: t("doctors.login"), onPress: () => {
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
            <View className="px-4 py-2">
                <DoctorCard
                    doctor={item}
                    onPress={handleDoctorPress}
                    isFavorite={dbUser?.favorites?.includes(item.id)}
                    onToggleFavorite={handleToggleFavorite}
                />
            </View>
        );
    };

    const renderSkeletonCard = () => (
        <View className="px-5">
            <View style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 14,
                marginBottom: 14,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#F3F4F6',
            }}>
                <View style={{ width: 76, height: 105, borderRadius: 16, backgroundColor: '#F9FAFB' }} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                    <View style={{ width: '70%', height: 20, borderRadius: 6, backgroundColor: '#F9FAFB', marginBottom: 8 }} />
                    <View style={{ width: '40%', height: 16, borderRadius: 6, backgroundColor: '#F9FAFB', marginBottom: 12 }} />
                    <View style={{ width: '100%', height: 1, backgroundColor: '#F3F4F6', marginBottom: 8 }} />
                    <View style={{ width: '90%', height: 14, borderRadius: 4, backgroundColor: '#F9FAFB' }} />
                </View>
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
                        <View className="px-4 mb-2">
                            <View className="flex-row items-center justify-center mb-4 px-1">
                                <View>
                                    <Text className="text-2xl font-bold text-gray-900">{t('doctors.findYourDoctor')}</Text>
                                    <Text className="text-gray-500 text-sm">{t('doctors.selectExpertPanel')}</Text>
                                </View>
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
                                    <Text className="text-gray-900 text-lg font-bold text-center">{t('doctors.noDoctorsFound')}</Text>
                                    <Text className="text-gray-500 text-center mt-2">
                                        {t('doctors.trySearchingDifferent')}
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
