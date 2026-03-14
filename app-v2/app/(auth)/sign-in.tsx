import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Pressable, Keyboard, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { AuthService } from '@/features/auth/services/auth.service';

const SignInScreen = () => {
    const { t } = useTranslation();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string>('');

    // Your backend URL
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    const handlePhoneSubmit = async () => {
        if (!phone.trim() || phone.length < 10) {
            toast.error(t('auth.invalidPhone'));
            return;
        }

        setLoading(true);

        try {
            let formattedPhone = phone.replace(/\D/g, '');

            const { exists, user } = await AuthService.checkUserExists(phone);
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
                    toast.success(t('auth.otpSent'));
                    router.push({
                        pathname: '/(auth)/otp-verify',
                        params: {
                            phone: phone,
                            isLogin: 'true',
                            userData: user ? JSON.stringify(user) : ''
                        }
                    });

                } else {
                    toast.error(`${t('auth.failedRequest')}! ${data.message || ''}`);
                }
            } else {
                toast.info(t('auth.pleaseRegister'));
                router.push({
                    pathname: "/(auth)/register",
                    params: {
                        phone: phone
                    }
                });
            }
        } catch (error) {
            console.error('[SignIn] Error:', error);
            toast.error(t('auth.networkError'));
        } finally {
            setLoading(false);
        }
    };

    const isPhoneValid = phone.trim() && phone.length >= 10;

    return (
        <View className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <Pressable className="flex-1" onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        className="px-6"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View className="pt-16 pb-12">
                            <TouchableOpacity
                                className="mb-8 w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                                onPress={() => router.back()}
                            >
                                <Ionicons name="chevron-back" size={24} color="#3B82F6" />
                            </TouchableOpacity>

                            <Text className="text-3xl font-bold text-gray-900 mb-3">
                                {t('auth.welcomeBack')}
                            </Text>
                            <Text className="text-gray-500 font-medium text-base leading-6">
                                {t('auth.signInSub')}
                            </Text>
                        </View>

                        {/* Phone Input */}
                        <View className="flex-1">
                            <View className="mb-8">
                                <Text className="text-gray-700 font-medium text-sm mb-3 ml-1">
                                    {t('auth.phoneNumber')}
                                </Text>
                                <View className={`bg-white rounded-2xl border-2 ${focusedField === 'phone' ? 'border-blue-500' : 'border-gray-50'
                                    }`}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 64, paddingHorizontal: 16 }}>
                                        <Text style={{
                                            fontFamily: 'Quicksand-Bold',
                                            fontSize: 16,
                                            color: '#111827',
                                            lineHeight: 20,
                                        }}>
                                            {t('auth.countryCode')}
                                        </Text>
                                        <View style={{ width: 1, height: 24, backgroundColor: '#E5E7EB', marginHorizontal: 12 }} />
                                        <TextInput
                                            placeholder={t('auth.phonePlaceholder')}
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="phone-pad"
                                            value={phone}
                                            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                                            onFocus={() => setFocusedField('phone')}
                                            onBlur={() => setFocusedField('')}
                                            selectionColor="#3B82F6"
                                            maxLength={11}
                                            autoFocus
                                            style={{
                                                flex: 1,
                                                fontFamily: 'Quicksand-Bold',
                                                fontSize: 16,
                                                color: '#111827',
                                                height: 64,
                                                paddingVertical: 0,
                                                includeFontPadding: false,
                                                textAlignVertical: 'center',
                                            }}
                                        />
                                    </View>
                                </View>
                                <Text className="text-gray-400 font-medium text-xs mt-2 ml-1">
                                    {t('auth.otpHint')}
                                </Text>
                            </View>

                            {/* Validation */}
                            <View className="mb-8">
                                <View className="flex-row items-center">
                                    <View className={`w-5 h-5 rounded-full mr-3 items-center justify-center ${isPhoneValid ? 'bg-blue-500' : 'bg-gray-200'
                                        }`}>
                                        {isPhoneValid && (
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        )}
                                    </View>
                                    <Text className={`font-medium text-sm ${isPhoneValid ? 'text-blue-600' : 'text-gray-400'
                                        }`}>
                                        {t('auth.validPhoneRequired')}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Continue Button */}
                        <View className="pb-12">
                            <TouchableOpacity
                                onPress={handlePhoneSubmit}
                                disabled={loading || !isPhoneValid}
                                className={`h-16 rounded-2xl items-center justify-center shadow-lg ${isPhoneValid && !loading
                                    ? 'bg-blue-500 shadow-blue-200'
                                    : 'bg-gray-200 shadow-none'
                                    }`}
                            >
                                <View className="flex-row items-center justify-center">
                                    {loading ? (
                                        <>
                                            <ActivityIndicator color="#ffffff" size="small" />
                                            <Text className="text-white font-bold text-lg ml-3">
                                                {t('auth.processing')}
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-white font-bold text-lg">
                                            {t('auth.continue')}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            <Text className="text-gray-400 font-medium text-sm text-center mt-6">
                                {t('auth.terms')}
                            </Text>
                        </View>
                    </ScrollView>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
};

export default SignInScreen;
