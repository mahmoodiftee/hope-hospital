import { userExistCheck } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { toast } from 'sonner-native';

const SignIn = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string>('');

    // Your backend URL
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    const handlePhoneSubmit = async () => {
        if (!phone.trim() || phone.length < 10) {
            toast.error('Error! Please enter a valid phone number');
            return;
        }

        setLoading(true);

        try {
            let formattedPhone = phone.replace(/\D/g, '');

            const { exists, user } = await userExistCheck({ phone: phone });
            if (exists === true) {
                const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber: formattedPhone
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('OTP sent for login verification!');
                    router.push({
                        pathname: '/otp-verify',
                        params: {
                            phone: phone,
                            isLogin: 'true',
                            userData: user ? JSON.stringify(user) : ''
                        }
                    });

                } else {
                    toast.error(`Error!, ${data.message} || Failed to process request`);
                }
            } else {
                toast.info('Please register first');
                router.push({
                    pathname: "/register",
                    params: {
                        phone: phone
                    }
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Network Error!, Could not connect to server. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const isPhoneValid = phone.trim() && phone.length >= 10;

    return (
        <>
            <View className="flex-1 pb-10 bg-white">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        className="px-6"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View className="pt-16 pb-12">
                            <TouchableOpacity className="mb-8" onPress={() => router.push("/profile")}>
                                <Ionicons name="chevron-back" size={28} color="#007AFF" />
                            </TouchableOpacity>

                            <Text className="text-3xl font-bold text-blue mb-3">
                                Welcome Back
                            </Text>
                            <Text className="text-dark-100/70 text-base leading-6">
                                Enter your phone number to login{'\n'}or create a new account.
                            </Text>
                        </View>

                        {/* Phone Input */}
                        <View className="flex-1">
                            <View className="mb-8">
                                <Text className="text-dark-100 text-sm font-medium mb-3 ml-1">
                                    Phone Number
                                </Text>
                                <View className={`bg-white rounded-xl border ${focusedField === 'phone'
                                    ? 'border-dark-100/10'
                                    : 'border-transparent'
                                    }`}>
                                    <View className="flex-row items-center px-4 py-4">
                                        <Text className="text-dark-100 text-base font-medium mr-2">
                                            +88
                                        </Text>
                                        <View className="w-0.5 h-6 bg-gray-600 mr-3" />
                                        <TextInput
                                            className=""
                                            placeholder="Enter phone number"
                                            placeholderTextColor="#666666"
                                            keyboardType="phone-pad"
                                            value={phone}
                                            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                                            onFocus={() => setFocusedField('phone')}
                                            onBlur={() => setFocusedField('')}
                                            selectionColor="#22c55e"
                                            maxLength={11}
                                            autoFocus
                                        />
                                    </View>
                                </View>
                                <Text className="text-gray-500 text-xs mt-2 ml-1">
                                    We&apos;ll send an OTP to verify your number
                                </Text>
                            </View>

                            {/* Validation */}
                            <View className="mb-8">
                                <View className="flex-row items-center">
                                    <View className={`w-4 h-4 rounded-full mr-3 items-center justify-center ${isPhoneValid ? 'bg-blue' : 'bg-gray-600'
                                        }`}>
                                        {isPhoneValid && (
                                            <Ionicons name="checkmark" size={10} color="white" />
                                        )}
                                    </View>
                                    <Text className={`text-sm ${isPhoneValid ? 'text-blue' : 'text-gray-500'
                                        }`}>
                                        Valid phone number required
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Continue Button */}
                        <View className="pb-12">
                            <TouchableOpacity
                                onPress={handlePhoneSubmit}
                                disabled={loading || !isPhoneValid}
                                className={`rounded-xl py-4 ${isPhoneValid && !loading
                                    ? 'bg-blue'
                                    : 'bg-gray-600'
                                    }`}
                                style={{
                                    opacity: (isPhoneValid && !loading) ? 1 : 0.6
                                }}
                            >
                                <View className="flex-row items-center justify-center">
                                    {loading ? (
                                        <>
                                            <ActivityIndicator color="#ffffff" size="small" />
                                            <Text className="text-white font-semibold text-lg ml-3">
                                                Processing...
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-white font-semibold text-lg">
                                            Continue
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            <Text className="text-gray-500 text-sm text-center mt-4">
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </>
    );
};

export default SignIn;