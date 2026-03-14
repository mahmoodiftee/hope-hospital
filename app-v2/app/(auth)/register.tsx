import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Pressable, Keyboard, TextInput } from 'react-native';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { useTranslation } from 'react-i18next';
import { AuthService } from '@/features/auth/services/auth.service';

const RegisterScreen = () => {
    const { t } = useTranslation();
    const { phone } = useLocalSearchParams<{ phone: string }>();

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string>('');

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    const handleRegister = async () => {
        if (!name.trim() || !age.trim()) {
            toast.error(t('auth.fillAllFields'));
            return;
        }

        if (parseInt(age) < 1 || parseInt(age) > 120) {
            toast.error(t('auth.invalidAge'));
            return;
        }

        setLoading(true);

        try {
            // Check if user somehow already exists (e.g. direct navigation or race condition)
            const { exists } = await AuthService.checkUserExists(phone!);
            if (exists) {
                toast.error(t('auth.alreadyHasAccount'));
                router.replace('/(auth)/sign-in');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
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
                toast.success(t('auth.otpSentRegister'));
                router.push({
                    pathname: '/(auth)/otp-verify',
                    params: {
                        phone: phone,
                        name: name.trim(),
                        age: age,
                        isLogin: 'false'
                    }
                });
            } else {
                toast.error(`${t('auth.failedRequest')}! ${data.message || ''}`);
            }
        } catch (error) {
            console.error('[Register] Error sending OTP:', error);
            toast.error(t('auth.networkError'));
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = name.trim() && age.trim() && parseInt(age) >= 1 && parseInt(age) <= 120;

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

                            <Text className="text-3xl font-bold text-gray-900 mb-3 py-1">
                                {t('auth.createAccount')}
                            </Text>
                            <Text className="text-gray-500 font-medium text-base leading-6">
                                {t('auth.registerSub')}
                            </Text>

                            <View className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <Text className="text-blue-600 font-bold text-sm">
                                    {t('auth.phone')}: {t('auth.countryCode')}{phone}
                                </Text>
                            </View>
                        </View>

                        {/* Form */}
                        <View className="flex-1">
                            <View className="mb-6">
                                <Text className="text-gray-700 font-medium text-sm mb-3 ml-1">
                                    {t('auth.fullName')}
                                </Text>
                                <View className={`bg-white rounded-2xl border-2 h-16 justify-center ${focusedField === 'name' ? 'border-blue-500' : 'border-gray-100'
                                    }`}>
                                    <AppTextInput
                                        placeholder={t('auth.enterFullName')}
                                        placeholderTextColor="#9CA3AF"
                                        value={name}
                                        onChangeText={setName}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField('')}
                                        autoCapitalize="words"
                                        autoFocus
                                        containerStyle={{ flex: 1 }}
                                    />
                                </View>
                            </View>

                            <View className="mb-8">
                                <Text className="text-gray-700 fontmedium text-sm mb-3 ml-1">
                                    {t('auth.age')}
                                </Text>
                                <View className={`bg-white rounded-2xl border-2 h-16 justify-center ${focusedField === 'age' ? 'border-blue-500' : 'border-gray-100'
                                    }`}>
                                    <TextInput
                                        placeholder={t('auth.agePlaceholder')}
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={age}
                                        onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
                                        onFocus={() => setFocusedField('age')}
                                        onBlur={() => setFocusedField('')}
                                        selectionColor="#3B82F6"
                                        maxLength={3}
                                        style={{
                                            fontFamily: 'Quicksand-Bold',
                                            fontSize: 16,
                                            color: '#111827',
                                            paddingHorizontal: 16,
                                            height: 64,
                                            paddingVertical: 0,
                                            includeFontPadding: false,
                                            textAlignVertical: 'center',
                                        }}
                                    />
                                </View>
                            </View>

                            {/* Validation */}
                            <View className="mb-8 flex flex-col gap-2">
                                <View className="flex-row items-center">
                                    <View className={`w-5 h-5 rounded-full mr-3 items-center justify-center ${name.trim() ? 'bg-blue-500' : 'bg-gray-100'
                                        }`}>
                                        {name.trim() && (
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        )}
                                    </View>
                                    <Text className="text-gray-400 font-medium text-sm">
                                        {t('auth.nameRequired')}
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <View className={`w-5 h-5 rounded-full mr-3 items-center justify-center ${parseInt(age) >= 1 && parseInt(age) <= 120 ? 'bg-blue-500' : 'bg-gray-100'
                                        }`}>
                                        {parseInt(age) >= 1 && parseInt(age) <= 120 && (
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        )}
                                    </View>
                                    <Text className={`font-medium text-sm ${parseInt(age) >= 1 && parseInt(age) <= 120 ? 'text-blue-600' : 'text-gray-400'
                                        }`}>
                                        {t('auth.validAgeRequired')}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Button */}
                        <View className="pb-12">
                            <TouchableOpacity
                                onPress={handleRegister}
                                disabled={loading || !isFormValid}
                                className={`h-16 rounded-2xl items-center justify-center shadow-lg ${isFormValid && !loading
                                    ? 'bg-blue-500 shadow-blue-200'
                                    : 'bg-gray-200 shadow-none'
                                    }`}
                            >
                                <View className="flex-row items-center justify-center">
                                    {loading ? (
                                        <>
                                            <ActivityIndicator color="#ffffff" size="small" />
                                            <Text className="text-white font-bold text-lg ml-3">
                                                {t('auth.sendingOtp')}
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-white font-bold text-lg">
                                            {t('auth.continue')}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
};

export default RegisterScreen;
