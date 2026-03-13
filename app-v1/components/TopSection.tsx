import { router } from "expo-router";
import { BadgeCheck, Bell, MapPin, UserRound } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface TopSectionProps {
    user: any;
    unreadCount: number;
}


const TopSection: React.FC<TopSectionProps> = ({
    user,
    unreadCount,
}) => {

    return (
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center pl-1">
                <Image
                    source={{ uri: user?.avatar || "https://i.ibb.co/gZNPsVsc/user.png" }}
                    className="h-12 w-12 mr-3"
                />
                <View className="">
                    <View className="flex-row items-center gap-1 ">
                        <Text className="text-dark-100 font-bold text-lg font-quicksand-semibold pl-.5">
                            {user?.name || "Johan Done"}
                        </Text>
                        <BadgeCheck color="#43B75D" size={15} />
                    </View>
                    <View className="flex-row items-center gap-0.5 ">
                        <MapPin color="rgba(0,0,0,0.6)" size={15} />
                        <Text className="text-dark-100/80">Gulshan 1, Dhaka</Text>
                    </View>

                </View>
            </View>
            <View className="p-2 flex-row items-center justify-between mb-1 gap-3">
                <TouchableOpacity
                    className="border-2 border-gray-200/10 rounded-full p-1 relative"
                    onPress={() => router.push("/notifications")}
                >
                    <Bell color="rgba(0,0,0,0.8)" size={20} />

                    {unreadCount > 0 && (
                        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full px-1.5 min-w-[16px] h-[16px] justify-center items-center">
                            <Text className="text-[10px] text-white font-bold text-center">
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="border-2 border-gray-200/10 rounded-full p-1"
                    onPress={() => router.push("/profile")}
                >
                    <UserRound color="rgba(0,0,0,0.8)" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TopSection;