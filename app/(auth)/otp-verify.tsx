// otp-verify.tsx - Enhanced OTP verification with auto-fill support
import { saveUserToDB } from "@/lib/appwrite";
import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

export default function OtpVerify() {
    const { name, age, phone, isLogin, userData } = useLocalSearchParams<{
        name?: string;
        age?: string;
        phone: string;
        isLogin?: string;
        userData?: any;
    }>();
    let parsedUserData: any = null;

    try {
        parsedUserData = userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error("Failed to parse userData:", error);
    }

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [isAutoFilling, setIsAutoFilling] = useState(false);

    const inputRefs = useRef<(TextInput | null)[]>([]);
    const containerRef = useRef<View>(null);

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    const isLoginFlow = isLogin === 'true';

    useEffect(() => {
        const setupNotifications = async () => {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                setToken(token);
            }
        };
        setupNotifications();
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleOtpChange = (text: string, index: number) => {
        if (text.length > 1) {
            const otpArray = text.replace(/[^0-9]/g, '').split('').slice(0, 6);
            const newOtp = [...otp];

            setIsAutoFilling(true);

            otpArray.forEach((digit, i) => {
                if (i < 6) {
                    newOtp[i] = digit;
                }
            });

            for (let i = otpArray.length; i < 6; i++) {
                newOtp[i] = '';
            }

            setOtp(newOtp);

            const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;

            setTimeout(() => {
                inputRefs.current[focusIndex]?.focus();
                setIsAutoFilling(false);
            }, 100);

            return;
        }

        // Handle single digit input
        const newOtp = [...otp];
        newOtp[index] = text.replace(/[^0-9]/g, '');
        setOtp(newOtp);

        // Auto-focus next input for single digit entry
        if (text && index < 5) {
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

    const handlePaste = (text: string) => {
        const otpDigits = text.replace(/[^0-9]/g, '').split('').slice(0, 6);
        if (otpDigits.length > 0) {
            const newOtp = ['', '', '', '', '', ''];
            otpDigits.forEach((digit, i) => {
                if (i < 6) newOtp[i] = digit;
            });
            setOtp(newOtp);

            const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
            setTimeout(() => inputRefs.current[focusIndex]?.focus(), 100);
        }
    };

    async function saveUserToSecureStore(user: any) {
        try {
            await SecureStore.setItemAsync('user', JSON.stringify(user));
        } catch (e) {
            console.error('Error saving user to SecureStore:', e);
        }
    }

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (!otpString || otpString.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: phone,
                    otp: otpString,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(isLoginFlow ? 'Login successful!' : 'Registration successful!');

                if (isLoginFlow) {

                    const userForStore = {
                        id: parsedUserData?.$id || parsedUserData?.id,
                        name: parsedUserData?.name,
                        age: parsedUserData?.age,
                        phone: parsedUserData?.phone,
                        pushToken: token || parsedUserData?.pushToken || "",
                        createdAt: parsedUserData?.createdAt || new Date().toISOString(),
                    };

                    await saveUserToSecureStore(userForStore);
                    router.replace('/(tabs)');
                } else {
                    try {
                        const cleanedUser = {
                            name: name!.trim(),
                            age: parseInt(age!),
                            phone: phone,
                            pushToken: token || "",
                        };

                        const savedUser = await saveUserToDB(cleanedUser);

                        const userForStore = {
                            id: savedUser.$id,
                            name: cleanedUser.name,
                            age: cleanedUser.age,
                            phone: cleanedUser.phone,
                            pushToken: token || "",
                            createdAt: new Date().toISOString(),
                        };

                        await saveUserToSecureStore(userForStore);
                        router.replace('/(tabs)');
                    } catch (dbError) {
                        console.error('Database error:', dbError);
                        toast.success('Phone verified, but saving user failed. Redirecting...');

                        setTimeout(() => {
                            router.replace('/(tabs)');
                        }, 2000);
                    }
                }
            } else {
                toast.error(data.message || 'Invalid or expired OTP');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            toast.error('Could not verify OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const handleResendOtp = async () => {
        if (!canResend) return;

        setResendLoading(true);

        try {
            const endpoint = '/api/send-otp';

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: phone
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('New OTP sent successfully!');
                setOtp(['', '', '', '', '', '']);
                setCountdown(60);
                setCanResend(false);
                inputRefs.current[0]?.focus();
            } else {
                toast.error(data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            toast.error('Could not resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };


    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <View className="flex-1 p-6 justify-center bg-gray-50">
            {/* Header */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-12 left-6 z-10"
            >
                <Ionicons name="chevron-back" size={28} color="#007AFF" />
            </TouchableOpacity>

            <View className="mb-8">
                <Text className="text-2xl font-bold mb-2 text-dark-100 text-center">
                    {isLoginFlow ? 'Welcome Back!' : 'Verify Your Number'}
                </Text>
                <Text className="text-dark-100/50 text-center mb-4">
                    {isLoginFlow
                        ? `Enter the code sent to +88${phone}`
                        : `Code sent to +88${phone}`
                    }
                </Text>
            </View>

            {/* Enhanced OTP Input with better auto-fill support */}
            <View ref={containerRef} className="flex-row justify-center space-x-3 mb-8">
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => { inputRefs.current[index] = ref; }}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={Platform.OS === 'ios' ? 1 : 6} // Allow longer input on Android for auto-fill
                        className={`w-12 h-14 border-2 rounded-lg text-center text-2xl font-medium bg-slate-100 text-dark-100 ${digit ? 'border-blue' : 'border-dark-100/10'
                            } ${isAutoFilling ? 'border-green-500' : ''}`}
                        selectionColor="#007AFF"
                        autoFocus={index === 0}
                        textContentType="oneTimeCode" // iOS auto-fill support
                        autoComplete="sms-otp" // Android auto-fill support
                        importantForAutofill="yes"
                        onFocus={() => {
                            // Clear field when focused for better UX
                            if (index === 0 && otp.join('') === '') {
                                // Only for first field when OTP is empty
                            }
                        }}
                        //@ts-ignore
                        onPaste={index === 0 ? (e: any) => handlePaste(e.nativeEvent.text) : undefined}
                    />
                ))}
            </View>

            {/* Auto-fill hint */}
            {Platform.OS === 'ios' && (
                <View className="items-center mb-4">
                    <Text className="text-gray-500 text-sm">
                        Tap &quot;AutoFill&quot; above the keyboard to fill OTP automatically
                    </Text>
                </View>
            )}

            {/* Resend Timer */}
            <View className="items-center mb-8">
                {canResend ? (
                    <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={resendLoading}
                        className="py-2 px-4 rounded-lg"
                    >
                        {resendLoading ? (
                            <View className="flex-row items-center">
                                <ActivityIndicator size="small" color="#22c55e" />
                                <Text className="text-blue font-medium ml-2">
                                    Sending...
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-dark-100/50 font-medium">
                                Didn&apos;t receive the code? <Text className="text-blue font-medium">Resend</Text>
                            </Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View className="items-center">
                        <Text className="text-gray-400 text-sm">
                            Resend code in {countdown}s
                        </Text>
                    </View>
                )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
                onPress={handleVerify}
                disabled={loading || !isOtpComplete}
                className={`py-4 rounded-xl items-center mb-4 ${loading || !isOtpComplete
                    ? 'bg-gray-600'
                    : 'bg-blue'
                    }`}
            >
                {loading ? (
                    <View className="flex-row items-center">
                        <ActivityIndicator color="#fff" />
                        <Text className="text-white font-semibold text-lg ml-2">
                            {isLoginFlow ? 'Logging in...' : 'Verifying...'}
                        </Text>
                    </View>
                ) : (
                    <Text className="text-white font-semibold text-lg">
                        {isLoginFlow ? 'Login' : 'Verify & Create Account'}
                    </Text>
                )}
            </TouchableOpacity>

            {/* User Info Display for Registration */}
            {!isLoginFlow && name && age && (
                <View className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                    <Text className="text-lg font-semibold text-dark-100 mb-2">
                        Account Details
                    </Text>
                    <View className="space-y-1">
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-500">Name:</Text>
                            <Text className="text-sm text-dark-100 font-medium">{name}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-500">Age:</Text>
                            <Text className="text-sm text-dark-100 font-medium">{age}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-500">Phone:</Text>
                            <Text className="text-sm text-dark-100 font-medium">+88{phone}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Login User Info Display */}
            {isLoginFlow && userData && (
                <View className="mt-4 p-4 bg-blue/10 rounded-xl border border-blue/20">
                    <Text className="text-lg font-semibold text-blue mb-2">
                        Welcome Back!
                    </Text>
                    <Text className="text-sm text-dark-100">
                        Logging in as {JSON.parse(userData).name}
                    </Text>
                </View>
            )}

            {/* Help Text */}
            <View className="mt-6 p-4 bg-gray-100 rounded-xl">
                <Text className="text-gray-600 text-sm text-center">
                    💡 {Platform.OS === 'ios'
                        ? 'Use "AutoFill" from your keyboard for instant OTP entry'
                        : 'OTP should auto-fill from your SMS. Check your messages if needed.'
                    }
                </Text>
            </View>
        </View>
    );
}