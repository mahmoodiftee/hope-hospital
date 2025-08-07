import React, {  useEffect, useRef, useMemo } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    StatusBar,
    Keyboard,
    Animated,
    Platform,
    StyleSheet,
} from 'react-native';
import { X, Stethoscope, PhoneCall, Tag } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import useAppwrite from '@/lib/useAppwrite';
import { getAllDoctors } from '@/lib/appwrite';
import Search from '@/components/Search';
import { Doctor } from '@/types';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface DoctorSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onDoctorSelect?: (doctor: Doctor) => void;
}

const skeletons = Array.from({ length: 4 });

const DoctorSearchModal: React.FC<DoctorSearchModalProps> = ({
    visible,
    onClose,
    onDoctorSelect,
}) => {
    // Animation values
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const params = useLocalSearchParams<{ query?: string; filter?: string }>();

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

    useEffect(() => {
        if (visible) {
            // Smooth entrance animation
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset animations
            slideAnim.setValue(screenHeight);
            fadeAnim.setValue(0);
        }
    }, [visible]);

    const handleClose = () => {
        Keyboard.dismiss();

        // Smooth exit animation
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: screenHeight,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const renderDoctorCard = ({ item }: { item: Doctor }) => {
        const handleDoctorPress = () => {
            handleClose();
            setTimeout(() => {
                router.push({
                    pathname: '/doctors/[id]',
                    params: { id: item.id },
                });
            }, 100);
            onDoctorSelect?.(item);
        };

        return (
            <View style={styles.card} className='shadow-lg'>
                <View className="flex-row gap-4 items-center justify-start mb-2.5">
                    <View className="w-24 h-32 items-center">
                        <Image
                            source={{ uri: item.image }}
                            className="w-full h-full rounded-2xl object-cover"
                        />
                    </View>
                    <View style={{ flex: 1 }} className="h-full items-start pt-4">
                        <Text className="text-2xl font-medium text-dark mb-0">{item.name}</Text>
                        <View className="flex-row gap-2 items-center opacity-80 mb-0">
                            <Stethoscope size={17} strokeWidth={2} />
                            <Text className="text-xl">{item.specialty}</Text>
                        </View>
                        <View className="flex-row gap-1 items-center opacity-80">
                            <Tag size={17} strokeWidth={2} />
                            <Text className="text-lg">{item.hourlyRate}</Text>
                            <Text className="text-lg mt-1">৳</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="border border-gray-100/50 flex-1 py-3 rounded-xl mr-2"
                        onPress={handleDoctorPress}
                    >
                        <Text className="text-center font-semibold text-gray-800">View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2.5 border border-gray-100/50 rounded-xl">
                        <PhoneCall size={18} strokeWidth={2} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderSkeletonCard = () => (
        <View style={styles.card} className='shadow-lg'>
            <View className="flex-row gap-4 items-center mb-2.5">
                <View className="w-24 h-32 rounded-2xl bg-gray-100/20" />
                <View className="flex-1 pt-4">
                    <View className="w-32 h-6 rounded-2xl bg-gray-100/20 mb-2" />
                    <View className="w-20 h-5 rounded-2xl bg-gray-100/20 mb-1" />
                    <View className="w-16 h-5 rounded-2xl bg-gray-100/20" />
                </View>
            </View>
            <View className="flex-row gap-2">
                <View className="flex-1 h-10 bg-gray-100/20 rounded-xl" />
                <View className="w-10 h-10 bg-gray-100/20 rounded-xl" />
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
            <Animated.View
                className="flex-1"
                style={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    opacity: fadeAnim
                }}
            >
                <Animated.View
                    className="flex-1 bg-gray-50"
                    style={{
                        transform: [{ translateY: slideAnim }],
                        marginTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight || 0,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        overflow: 'hidden',
                    }}
                >
                    {/* Handle Bar */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 bg-gray-300 rounded-full" />
                    </View>

                    {/* Header */}
                    <View className="mx-4 pt-1">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-dark-100 text-3xl font-bold pl-1">Find Doctor</Text>
                            <TouchableOpacity
                                className="border-2 border-gray-200/10 rounded-full p-1 mr-1.5"
                                onPress={handleClose}
                            >
                                <X color="rgba(0,0,0,0.8)" size={20} />
                            </TouchableOpacity>
                        </View>
                        <Search />
                    </View>

                    {/* Results */}
                    <View className="flex-1">
                        {loading ? (
                            <FlatList
                                data={skeletons}
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
                        )}
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 10,
        marginBottom: 16,
        marginHorizontal: 16,
    },
});

export default DoctorSearchModal;