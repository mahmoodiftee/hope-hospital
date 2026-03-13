import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, TextInput, Pressable, Keyboard } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { toast } from "sonner-native";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { AuthService } from "@/features/auth/services/auth.service";
import { User, DbUser } from "@/shared/types";

export default function OtpVerifyScreen() {
    const { name, age, phone, isLogin, userData } = useLocalSearchParams<{
        name?: string;
        age?: string;
        phone: string;
        isLogin?: string;
        userData?: string;
    }>();

    const setSession = useAuthStore(state => state.setSession);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);

    const inputRefs = useRef<(TextInput | null)[]>([]);

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    const isLoginFlow = isLogin === 'true';

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleOtpChange = (text: string, index: number) => {
        const cleanedText = text.replace(/[^0-9]/g, '');

        if (cleanedText.length > 1) {
            // Handle multi-character paste or auto-fill
            const otpArray = cleanedText.split('').slice(0, 6);
            const newOtp = [...otp];

            setIsAutoFilling(true);
            otpArray.forEach((digit, i) => {
                if (i < 6) newOtp[i] = digit;
            });

            setOtp(newOtp);
            const focusIndex = otpArray.length < 6 ? otpArray.length : 5;
            setTimeout(() => inputRefs.current[focusIndex]?.focus(), 50);
            setIsAutoFilling(false);
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = cleanedText;
        setOtp(newOtp);

        if (cleanedText && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phone, otp: otpString }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(isLoginFlow ? 'Welcome back!' : 'Account created successfully!');

                let dbUser: DbUser;
                if (isLoginFlow) {
                    dbUser = JSON.parse(userData!) as DbUser;
                } else {
                    try {
                        dbUser = await AuthService.createUser({
                            name: name!.trim(),
                            age: parseInt(age!),
                            phone: phone,
                        });
                    } catch (createError: any) {
                        if (createError.message.includes('already exists')) {
                            // Race condition: User was created in the meantime, or already existed.
                            // Since OTP is verified, we can safely just fetch and login.
                            const existingUser = await AuthService.getUser(phone);
                            if (existingUser) {
                                dbUser = existingUser;
                            } else {
                                throw createError;
                            }
                        } else {
                            throw createError;
                        }
                    }
                }

                const user: User = {
                    id: dbUser.$id,
                    name: dbUser.name,
                    age: dbUser.age,
                    phone: dbUser.phone,
                    createdAt: (dbUser as any).$createdAt || new Date().toISOString(),
                };

                await setSession(user, dbUser);
                router.replace('/(tabs)');
            } else {
                toast.error(data.message || 'Invalid or expired OTP');
            }
        } catch (error) {
            console.error('[OtpVerify] Error:', error);
            toast.error('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        setResendLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phone }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('New OTP sent!');
                setOtp(['', '', '', '', '', '']);
                setCountdown(60);
                setCanResend(false);
                inputRefs.current[0]?.focus();
            } else {
                toast.error(data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('[OtpVerify] Resend error:', error);
            toast.error('Could not resend OTP.');
        } finally {
            setResendLoading(false);
        }
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <View className="flex-1 bg-white px-6">
            <Pressable className="flex-1" onPress={Keyboard.dismiss}>
                <View className="pt-16 pb-8">
                    <TouchableOpacity
                        className="mb-8 w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#3B82F6" />
                    </TouchableOpacity>

                    <Text className="text-3xl font-quicksand-bold text-gray-900 mb-3 text-center">
                        {isLoginFlow ? 'Welcome Back!' : 'Verify Number'}
                    </Text>
                    <Text className="text-gray-500 font-quicksand-medium text-base text-center">
                        We've sent a 6-digit code to{'\n'}
                        <Text className="text-blue-600 font-quicksand-bold">+88{phone}</Text>
                    </Text>
                </View>

                {/* OTP Input Grid */}
                <View className="flex-row justify-center gap-2 mb-10">
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={Platform.OS === 'ios' ? 1 : 6}
                            className={`w-12 h-16 border-2 rounded-2xl text-center text-2xl font-quicksand-bold bg-gray-50 text-gray-900 ${digit ? 'border-blue-500 bg-white' : 'border-gray-50'
                                } ${isAutoFilling ? 'border-green-500' : ''}`}
                            selectionColor="#3B82F6"
                            autoFocus={index === 0}
                            textContentType="oneTimeCode" // iOS auto-fill
                            autoComplete="sms-otp" // Android auto-fill
                        />
                    ))}
                </View>

                {/* Demo Mode Hint */}
                <View className="mb-10 px-4">
                    <View className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 items-center">
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="bulb" size={18} color="#3B82F6" />
                            <Text className="text-blue-600 font-quicksand-bold ml-2">Demo Mode</Text>
                        </View>
                        <Text className="text-gray-600 font-quicksand-medium text-center">
                            Use <Text className="text-blue-600 font-quicksand-bold">123456</Text> to skip verification
                        </Text>
                    </View>
                </View>

                {/* Resend Logic */}
                <View className="items-center mb-10">
                    {canResend ? (
                        <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
                            {resendLoading ? (
                                <ActivityIndicator size="small" color="#3B82F6" />
                            ) : (
                                <Text className="text-gray-500 font-quicksand-medium">
                                    Didn't receive the code? <Text className="text-blue-600 font-quicksand-bold">Resend</Text>
                                </Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <Text className="text-gray-400 font-quicksand-medium">
                            Resend code in <Text className="text-gray-600 font-quicksand-bold">{countdown}s</Text>
                        </Text>
                    )}
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={loading || !isOtpComplete}
                    className={`h-16 rounded-2xl items-center justify-center shadow-lg ${isOtpComplete && !loading ? 'bg-blue-500 shadow-blue-200' : 'bg-gray-200 shadow-none'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-quicksand-bold text-lg">
                            {isLoginFlow ? 'Login' : 'Verify & Continue'}
                        </Text>
                    )}
                </TouchableOpacity>
            </Pressable>
        </View>
    );
}
