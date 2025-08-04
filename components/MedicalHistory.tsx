import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Download } from 'lucide-react-native';
import { images } from '@/constants';

type ImageKey = keyof typeof images;

export const medicalHistory: { id: number; type: string; title: string; date: string; icon: ImageKey; iconBg: string; iconColor: string; viewText: string; viewColor: string; }[] = [
    {
        id: 1,
        type: "Prescription",
        title: "Prescription from Dr. Mahabub Alom",
        date: "May 13, 2024",
        icon: "report",
        iconBg: "#E8F5E9",
        iconColor: "#34A853",
        viewText: "View Prescription",
        viewColor: "#10B981"
    },
    {
        id: 2,
        type: "Blood Test",
        title: "Blood Test Report",
        date: "May 25, 2024",
        icon: "blood",
        iconBg: "#E3F2FD",
        iconColor: "#1A73E8",
        viewText: "View Test Report",
        viewColor: "#3B82F6"
    },
    {
        id: 3,
        type: "Certificate",
        title: "Medical Certificate",
        date: "June 1, 2023",
        icon: "certificate",
        iconBg: "#FFF8E1",
        iconColor: "#F9AB00",
        viewText: "View Certificate",
        viewColor: "#F59E0B"
    }
];



const MedicalHistory = () => {

    const onViewPress = (item: any) => {
        console.log('View Pressed:', item);
    };

    const onDownloadPress = (item: any) => {
        console.log('Download Pressed:', item);
    };

    return (
        <View className="">
            {medicalHistory.map((item) => (
                <View key={item.id} className="border-2 border-white/10 bg-white rounded-xl p-4 shadow-sm mb-2">
                    <View className="flex-row items-start">
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-1"
                            style={{ backgroundColor: item.iconBg }}
                        >
                            <Image
                                //@ts-ignore
                                source={images[item.icon]}
                                className="size-6"
                            />
                        </View>

                        <View className="flex-1">
                            <Text style={{ color: item.iconColor }} className="text-dark-100 font-semibold text-sm mb-1">
                                {item.title}
                            </Text>
                            <Text className="text-gray-500 text-xs mb-3">
                                {item.date}
                            </Text>

                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    className="px-4 py-2 rounded-lg mr-4"
                                    style={{ backgroundColor: item.iconBg }}
                                    onPress={() => onViewPress?.(item)}
                                >
                                    <Text
                                        className="text-sm font-medium"
                                        style={{ color: item.iconColor }}
                                    >
                                        {item.viewText}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="px-4 py-2 rounded-lg flex-row gap-1 justify-center items-end"
                                    onPress={() => onDownloadPress?.(item)}
                                >
                                    <View className="mb-1">
                                        <Download color={item.iconColor} size={15} />
                                    </View>
                                    <Text style={{ color: item.iconColor }} className="text-sm font-medium">
                                        Download
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};

export default MedicalHistory;