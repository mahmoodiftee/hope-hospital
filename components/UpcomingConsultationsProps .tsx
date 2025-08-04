import React, { useRef } from 'react';
import { View, FlatList, TouchableOpacity, Dimensions, ImageBackground, Image, Text } from 'react-native';
import HeaderText from './HeaderText';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react-native';
import { images } from "@/constants";

type DoctorType = {
    id: number;
    name: string;
    specialization: string;
    image: string;
    location: string;
    time: string;
    bgColor: string;
};


export const doctors: DoctorType[] = [
    {
        id: 1,
        name: "Dr. Masud Khan",
        specialization: "Specializes in mental health",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop&crop=face",
        location: "Dhaka, Gulshan 2",
        time: "24 Feb, 11:00 pm",
        bgColor: "bg-blue/90"
    },
    {
        id: 2,
        name: "Dr. Sarah Ahmed",
        specialization: "Cardiologist & Heart Specialist",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=50&h=50&fit=crop&crop=face",
        location: "Dhaka, Dhanmondi",
        time: "25 Feb, 2:30 pm",
        bgColor: "bg-blue/90"
    },
    {
        id: 3,
        name: "Dr. Rahman Ali",
        specialization: "Pediatrician & Child Care",
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=50&h=50&fit=crop&crop=face",
        location: "Dhaka, Uttara",
        time: "26 Feb, 10:00 am",
        bgColor: "bg-blue/90"
    }
];

const { width: screenWidth } = Dimensions.get('window');

const UpcomingConsultations = () => {
    const flatListRef = useRef<FlatList<DoctorType>>(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const cardWidth = screenWidth - 30;
    const cardMargin = 8;


    const onScroll = (event: any) => {
        const slideSize = cardWidth + cardMargin;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setCurrentIndex(index);
    };

    const onDotPress = (index: number) => {
        setCurrentIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const renderDoctorCard = ({ item: doctor }: { item: DoctorType }) => (
        <View style={{ width: cardWidth, marginRight: cardMargin }}>
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