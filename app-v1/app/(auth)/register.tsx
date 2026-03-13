// register.tsx - Registration form for new users
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

const Register = () => {
    const { phone } = useLocalSearchParams<{ phone: string }>();

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string>('');

    // Your backend URL
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    const handleRegister = async () => {
        if (!name.trim() || !age.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (parseInt(age) < 1 || parseInt(age) > 120) {
            toast.error('Please enter a valid age');
            return;
        }

        setLoading(true);

        try {
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
                toast.success('OTP sent for login verification!');
                router.push({
                    pathname: '/otp-verify',
                    params: {
                        phone: phone,
                        name: name.trim(),
                        age: parseInt(age),
                    }
                });
            } else {
                toast.error(`Error!, ${data.message} || Failed to process request`);
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Could not connect to server. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };


    const isFormValid = name.trim() && age.trim() && parseInt(age) >= 1 && parseInt(age) <= 120;

    return (
        <>
            <View className="flex-1 pb-10">
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
                            <TouchableOpacity className="mb-8" onPress={() => router.back()}>
                                <Ionicons name="chevron-back" size={28} color="#007AFF" />
                            </TouchableOpacity>

                            <Text className="text-3xl font-bold text-blue mb-3">
                                Create Account
                            </Text>
                            <Text className="text-dark-100/70 text-base leading-6">
                                Complete your profile to finish{'\n'}setting up your account.
                            </Text>

                            {/* Show phone number */}
                            <View className="mt-4 p-3 bg-blue/10 rounded-lg">
                                <Text className="text-blue text-sm font-medium">
                                    Phone: +88{phone}
                                </Text>
                            </View>
                        </View>

                        {/* Form */}
                        <View className="flex-1">
                            {/* Full Name Field */}
                            <View className="mb-6">
                                <Text className="text-dark-100 text-sm font-medium mb-3 ml-1">
                                    Full Name
                                </Text>
                                <View className={`bg-white rounded-xl border ${focusedField === 'name'
                                    ? 'border-dark-100/10'
                                    : 'border-transparent'
                                    }`}>
                                    <TextInput
                                        className="px-4 py-4 text-dark-100 text-base"
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#666666"
                                        value={name}
                                        onChangeText={setName}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField('')}
                                        selectionColor="#22c55e"
                                        autoCapitalize="words"
                                        autoFocus
                                    />
                                </View>
                            </View>

                            {/* Age Field */}
                            <View className="mb-8">
                                <Text className="text-dark-100 text-sm font-medium mb-3 ml-1">
                                    Age
                                </Text>
                                <View className={`bg-white rounded-xl border ${focusedField === 'age'
                                    ? 'border-dark-100/10'
                                    : 'border-transparent'
                                    }`}>
                                    <TextInput
                                        className="px-4 py-4 text-dark-100 text-base"
                                        placeholder="Enter your age"
                                        placeholderTextColor="#666666"
                                        keyboardType="numeric"
                                        value={age}
                                        onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
                                        onFocus={() => setFocusedField('age')}
                                        onBlur={() => setFocusedField('')}
                                        selectionColor="#22c55e"
                                        maxLength={3}
                                    />
                                </View>
                            </View>

                            {/* Validation Requirements */}
                            <View className="mb-8">
                                <View className="flex-row items-center mb-2">
                                    <View className={`w-4 h-4 rounded-full mr-3 items-center justify-center ${name.trim() ? 'bg-blue' : 'bg-gray-600'
                                        }`}>
                                        {name.trim() && (
                                            <Ionicons name="checkmark" size={10} color="white" />
                                        )}
                                    </View>
                                    <Text className={`text-sm ${name.trim() ? 'text-blue' : 'text-gray-500'
                                        }`}>
                                        Name is required
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <View className={`w-4 h-4 rounded-full mr-3 items-center justify-center ${parseInt(age) >= 1 && parseInt(age) <= 120 ? 'bg-blue' : 'bg-gray-600'
                                        }`}>
                                        {parseInt(age) >= 1 && parseInt(age) <= 120 && (
                                            <Ionicons name="checkmark" size={10} color="white" />
                                        )}
                                    </View>
                                    <Text className={`text-sm ${parseInt(age) >= 1 && parseInt(age) <= 120 ? 'text-blue' : 'text-gray-500'
                                        }`}>
                                        Valid age required (1-120)
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Continue Button */}
                        <View className="pb-12">
                            <TouchableOpacity
                                onPress={handleRegister}
                                disabled={loading || !isFormValid}
                                className={`rounded-xl py-4 ${isFormValid && !loading
                                    ? 'bg-blue'
                                    : 'bg-gray-600'
                                    }`}
                                style={{
                                    opacity: (isFormValid && !loading) ? 1 : 0.6
                                }}
                            >
                                <View className="flex-row items-center justify-center">
                                    {loading ? (
                                        <>
                                            <ActivityIndicator color="#ffffff" size="small" />
                                            <Text className="text-white font-semibold text-lg ml-3">
                                                Sending OTP...
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-white font-semibold text-lg">
                                            Continue
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </>
    );
};

export default Register;