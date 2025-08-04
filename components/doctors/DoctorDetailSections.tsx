import { images } from '@/constants';
import { BriefcaseMedical, Tag } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';

interface DoctorInfoProps {
    doctor: any;
}

export const DoctorInfo: React.FC<DoctorInfoProps> = ({ doctor }) => (
    <View className="bg-white">
        <View className="px-6 pb-6">
            <Image
                source={{ uri: doctor?.image }}
                className="w-full aspect-[4/3] rounded-2xl object-cover"
            />
        </View>
        <View className="px-6 pb-6">
            <Text className="text-2xl font-semibold text-dark-100 mb-3">
                {doctor?.name}
            </Text>
            <View className="flex-row items-center gap-6">
                <View className="flex-row items-center gap-2">
                    <BriefcaseMedical size={16} color="#007AFF" strokeWidth={2} />
                    <Text className="text-lg text-gray-600">{doctor?.specialty}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Tag size={16} color="#007AFF" strokeWidth={2.5} />
                    <Text className="text-lg text-gray-600">{doctor?.hourlyRate}৳</Text>
                </View>
            </View>
        </View>
    </View>
);

export const DoctorExperience: React.FC<{ experience: string }> = ({ experience }) => (
    <View className="bg-white px-6 py-6">
        <View className="flex-row items-center gap-3 mb-4">
            <Image source={images.graduate} className="w-6 h-6" />
            <Text className="text-lg font-semibold text-dark-100">Experience</Text>
        </View>
        <Text className="text-lg text-gray-600 leading-6">{experience}</Text>
    </View>
);

export const DoctorSpecialties: React.FC<{ specialties: string[] }> = ({ specialties }) => (
    <View className="bg-white px-6 py-6">
        <View className="flex-row items-center gap-3 mb-4">
            <Image source={images.stethoscope} className="w-6 h-6" />
            <Text className="text-lg font-semibold text-dark-100">Speciality</Text>
        </View>
        <View className="gap-3">
            {specialties?.map((specialty: string, index: number) => (
                <View key={index} className="flex-row items-start justify-start">
                    <Text className="text-gray-400 mr-3 text-lg">•</Text>
                    <Text className="text-lg text-gray-600 leading-6">{specialty}</Text>
                </View>
            ))}
        </View>
    </View>
);

const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars.push(<Text key={i} className="text-yellow-400 text-lg">⭐</Text>);
    }
    if (hasHalfStar) {
        stars.push(<Text key="half" className="text-yellow-400 text-lg">⭐</Text>);
    }
    return stars;
};

export const DoctorReviews: React.FC<{ reviews?: any[] }> = ({ reviews }) => (
    <View className="bg-white py-6">
        <Text className="text-lg font-semibold text-dark-100 px-6 mb-4">Patient Reviews</Text>
        {reviews && reviews.length > 0 ? (
            <FlatList
                data={reviews}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
                renderItem={({ item }) => (
                    <View className="bg-gray-50 rounded-xl p-4 mr-4 max-w-[22rem]">
                        <Text className="text-lg text-gray-700 leading-6">&quot;{item.patientName}&quot;</Text>
                        <View className="flex-row mb-1">{renderStars(item.rating)}</View>
                        <Text className="text-lg text-gray-700 leading-6 pl-1">{item.review}</Text>
                    </View>
                )}
            />
        ) : (
            <Text className="text-center text-gray-500 px-6">
                No reviews available for this doctor.
            </Text>
        )}
    </View>
);