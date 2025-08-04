import React from 'react';
import { View, Text, Image } from 'react-native';
import { Stethoscope } from 'lucide-react-native';

interface DoctorInfoCardProps {
    doctor: {
        id: string;
        name: string;
        specialty: string;
        image: string;
    };
}

const DoctorInfoCard: React.FC<DoctorInfoCardProps> = ({ doctor }) => {
    return (
        <View className="bg-gray-50 h-32 rounded-3xl p-2.5 my-2 mx-4 shadow-sm">
            <View className="flex-row gap-4 items-center justify-start">
                <View className="w-16 items-center">
                    <Image
                        source={{ uri: doctor.image }}
                        className="w-full h-full rounded-2xl object-cover"
                    />
                </View>
                <View style={{ flex: 1, flexDirection: 'column' }} className='h-full justify-center'>
                    <Text className="text-2xl font-medium tracking-wide text-dark mb-0">
                        {doctor.name}
                    </Text>
                    <View className="flex-row gap-2 justify-start items-center mb-0 opacity-80">
                        <Stethoscope size={17} strokeWidth={2} />
                        <Text className="text-xl">{doctor.specialty}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default DoctorInfoCard;