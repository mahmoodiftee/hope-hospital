import { useRouter } from "expo-router";
import { BadgeCheck, Bell, MapPin, UserRound } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface TopSectionProps {
    user: any;
    unreadCount: number;
}


export const TopSection: React.FC<TopSectionProps> = ({
    user,
    unreadCount,
}) => {
    const router = useRouter();

    return (
        <View className="flex-row items-center justify-between mb-6 px-1">
            <View className="flex-row items-center">
                <View className="relative">
                    <Image
                        source={{ uri: user?.avatar || "https://i.ibb.co/gZNPsVsc/user.png" }}
                        className="h-10 w-10"
                    />
                    <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white items-center justify-center">
                        <BadgeCheck color="#fff" size={10} />
                    </View>
                </View>
                <View className="ml-2">
                    <Text className="text-gray-900 text-lg font-bold">
                        {user?.name || "John Doe"}
                    </Text>
                    <View className="flex-row items-center gap-1" style={{ opacity: 0.6 }}>
                        <MapPin color="#3B82F6" size={12} />
                        <Text className="text-gray-900 font-semibold text-xs">Gulshan 1, Dhaka</Text>
                    </View>
                </View>
            </View>
            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    className="w-11 h-11 rounded-2xl items-center justify-center border relative"
                    style={{ backgroundColor: 'rgba(249, 250, 251, 0.8)', borderColor: 'rgba(243, 244, 246, 0.5)' }}
                    onPress={() => router.push("/notifications")}
                >
                    <Bell color="#374151" size={22} />
                    {unreadCount > 0 && (
                        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 justify-center items-center border-2 border-white">
                            <Text className="text-[10px] text-white font-black">
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View className="bg-blue-50 p-1 rounded-full border" style={{ borderColor: 'rgba(219, 234, 254, 0.5)' }}>
                    <LanguageSwitcher />
                </View>
            </View>
        </View>
    );
};
