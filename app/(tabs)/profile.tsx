import { unregisterUserFromNotifications } from "@/hooks/nativeNotify";
import useAuthStore from "@/store/auth.store";
import useNotificationStore from "@/store/notification.store";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
    BadgeCheck,
    Bell,
    Calendar,
    ChevronRight,
    FileText,
    Heart,
    HelpCircle,
    LogOut,
    Phone,
    ShieldCheck,
    User
} from "lucide-react-native";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function Profile() {
    const { user, dbUser, isAuthenticated, isLoading, fetchAuthenticatedUser, setUser, setIsAuthenticated } = useAuthStore();
    const { resetNotifications, unreadCount } = useNotificationStore();
    const router = useRouter();

    useEffect(() => {
        fetchAuthenticatedUser();
    }, []);
    console.log("dbUser", JSON.stringify(dbUser, null, 2));
    console.log("user", JSON.stringify(user, null, 2));

    const quickActions = [
        { id: 1, url: "/appointment", title: "Booked", subtitle: "Appointment", icon: Calendar, color: "#007AFF" },
        { id: 2, url: "/notifications", title: "Notifications", subtitle: "Messages", icon: Bell, color: "#f97316" },
        { id: 3, url: "/contact", title: "Emergency", subtitle: "Services", icon: Phone, color: "#FF3B30" },
        { id: 4, url: "/prescriptions", title: "Find", subtitle: "Prescriptions", icon: FileText, color: "#22c55e" }
    ];

    const settingsItems = [
        { title: "Personal Information", icon: User, color: "#007AFF" },
        { title: "Privacy & Security", icon: ShieldCheck, color: "#30D158" },
        { title: "Help & Support", icon: HelpCircle, color: "#AF52DE" }
    ];

    // Show loading only when actually loading
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <View className="flex-col items-center gap-2">
                    <ActivityIndicator color="#007AFF" size="large" />
                    <Text className="pl-1 text-dark-100 text-xl font-semibold ml-2">
                        Loading...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleLogout = async () => {
        try {
            // Immediately update the UI state
            setUser(null);
            setIsAuthenticated(false);

            // Reset notification store to clear all notification data
            resetNotifications();

            // Clear storage in the background
            await SecureStore.deleteItemAsync("user");
            await unregisterUserFromNotifications(user?.id || dbUser?.$id);
            toast.success('Signed Out');

            router.replace("/profile");
        } catch (error) {
            console.log("Logout failed:", error);
            toast.error('Please try again', error as any);
        }
    };

    const handleLogin = () => {
        router.push("/sign-in");
    };

    // Show non-authenticated view if user is not logged in
    if (!isAuthenticated || !user) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 ">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="px-4 my-20">
                        {/* Welcome Card */}
                        <View
                            className="bg-white rounded-3xl p-8 mb-4"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 10,
                                elevation: 1
                            }}
                        >
                            <View className="items-center">
                                <View className="w-20 h-20 rounded-full mb-6 items-center justify-center" style={{ backgroundColor: "#F2F2F7" }}>
                                    <User size={32} color="#8E8E93" />
                                </View>

                                <Text className="text-black text-xl font-semibold mb-3 text-center">Welcome to Hope Hospital</Text>
                                <Text className="text-gray-500 text-base text-center mb-4 leading-6">Sign in to access your health information</Text>

                                <TouchableOpacity onPress={handleLogin} className="w-full rounded-full py-4 mb-4" style={{ backgroundColor: "#007AFF" }}>
                                    <Text className="text-white text-center font-semibold text-base">Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Emergency Card */}
                        <TouchableOpacity
                            className="bg-white rounded-3xl shadow-sm p-6"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 10
                            }}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: "#FFEBEE" }}>
                                        <Phone size={20} color="#FF3B30" />
                                    </View>
                                    <View>
                                        <Text className="text-black font-medium text-base">Emergency</Text>
                                        <Text className="text-gray-500 text-sm">Call 911</Text>
                                    </View>
                                </View>
                                <ChevronRight size={16} color="#C7C7CC" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Show authenticated user profile
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-4 py-3">
                    <Text className="text-dark-100 text-3xl font-bold mb-3 pl-1">Profile</Text>

                    {/* User Card */}
                    <View
                        className="bg-white rounded-3xl p-6 mb-4"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 10
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-4 flex-1">
                                <Image
                                    source={{ uri: user?.avatar || "https://i.ibb.co/Z6LYBgVB/user.jpg" }}
                                    className="w-16 h-16"
                                />
                                <View className="flex-1">
                                    <Text className="text-black text-xl font-semibold mb-1">{user?.name || "User"}</Text>
                                    <Text className="text-gray-500 text-base">{user?.phone || "Manage your health"}</Text>
                                </View>
                            </View>

                            <BadgeCheck color="#43B75D" size={25} />
                            {/* <Image
                                source={{ uri: user?.avatar || "https://i.ibb.co/Z6LYBgVB/user.jpg" }}
                                className="size-5"
                            /> */}
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View className="mb-4">
                        <View className="flex-row flex-wrap justify-between">
                            {quickActions.map((action) => (
                                <TouchableOpacity
                                    key={action.id}
                                    onPress={() => action.url && router.push(action.url as any)}
                                    className="w-[48%] rounded-3xl p-6 mb-4"
                                    style={{
                                        backgroundColor: "white",
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 10
                                    }}
                                >
                                    <View className="items-start">
                                        <View
                                            className="w-12 h-12 rounded-full items-center justify-center mb-6 relative"
                                            style={{ backgroundColor: `${action.color}15` }}
                                        >
                                            <action.icon color={action.color} size={24} />
                                            {action.id === 2 && unreadCount > 0 && (
                                                <View className="absolute -top-2 -right-2 bg-red-500 rounded-full px-1.5 min-w-[16px] h-[16px] justify-center items-center">
                                                    <Text className="text-[10px] text-white font-bold text-center">
                                                        {unreadCount}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="ml-2 text-black font-semibold text-base mb-1">{action.title}</Text>
                                        <Text className="ml-2 text-gray-500 text-sm">{action.subtitle}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Settings */}
                    <View className="mb-4">
                        {settingsItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                className="bg-white rounded-3xl mb-2 flex-row gap-4 items-center justify-between p-6"
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 10
                                }}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${item.color}15` }}>
                                        <item.icon size={18} color={item.color} />
                                    </View>
                                    <Text className="text-black text-base font-medium">{item.title}</Text>
                                </View>
                                <ChevronRight size={16} color="#C7C7CC" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Health Summary */}
                    <View className="rounded-3xl p-6 mb-4 overflow-hidden border border-green-100 bg-green-50">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-green-100">
                                <Heart size={20} color="#32D74B" />
                            </View>
                            <Text className="text-green-900 font-semibold text-lg">Health Summary</Text>
                        </View>
                        <Text className="text-green-800 text-base leading-6">Everything looking good. Your next checkup is in 2 weeks.</Text>
                    </View>

                    {/* Emergency */}
                    <TouchableOpacity
                        className="bg-white rounded-3xl p-6 mb-2"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 10
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: "#FFEBEE" }}>
                                    <Phone size={20} color="#FF3B30" />
                                </View>
                                <View>
                                    <Text className="text-black font-medium text-base">Emergency</Text>
                                    <Text className="text-gray-500 text-sm">Call 911</Text>
                                </View>
                            </View>
                            <ChevronRight size={16} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>

                    {/* Sign Out */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-white rounded-3xl p-6 mb-2"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 10
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: "#FFEBEE" }}>
                                    <LogOut size={20} color="red" />
                                </View>
                                <Text className="text-black font-medium text-base">Sign Out</Text>
                            </View>
                            <ChevronRight size={16} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                    <View className="h-32"></View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}