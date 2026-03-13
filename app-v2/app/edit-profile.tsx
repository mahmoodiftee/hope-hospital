import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Pressable, Keyboard } from 'react-native';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth';
import { AuthService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export default function EditProfileScreen() {
    const { user, dbUser, isAuthenticated } = useAuth();
    const setSession = useAuthStore(state => state.setSession);

    const [name, setName] = useState(dbUser?.name || '');
    const [age, setAge] = useState(dbUser?.age?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string>('');

    const handleSave = async () => {
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
            const updatedDbUser = await AuthService.updateProfile(dbUser!.$id, {
                name: name.trim(),
                age: parseInt(age),
            });

            // Update local session
            if (user) {
                await setSession({ ...user, name: updatedDbUser.name, age: updatedDbUser.age }, updatedDbUser);
            }

            toast.success('Profile updated successfully!');
            router.back();
        } catch (error) {
            console.error('[EditProfile] Error:', error);
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const isChanged = name !== dbUser?.name || age !== dbUser?.age?.toString();
    const isValid = name.trim() && age.trim() && parseInt(age) >= 1 && parseInt(age) <= 120;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{
                headerShown: false
            }} />

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
                        <View className="pt-8 pb-10">
                            <TouchableOpacity
                                className="mb-8 w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                                onPress={() => router.back()}
                            >
                                <Ionicons name="chevron-back" size={24} color="#3B82F6" />
                            </TouchableOpacity>

                            <Text className="text-3xl font-bold text-gray-900 mb-3">
                                Edit Profile
                            </Text>
                            <Text className="text-gray-500 font-medium text-base leading-6">
                                Update your personal information to{'\n'}keep your records accurate.
                            </Text>
                        </View>

                        {/* Form */}
                        <View className="flex-1">
                            <View className="mb-6">
                                <Text className="text-gray-700 font-medium text-sm mb-3 ml-1">
                                    Full Name
                                </Text>
                                <View className={`bg-white rounded-2xl border-2 h-16 ${focusedField === 'name'
                                    ? 'border-blue-500'
                                    : 'border-gray-100'
                                    }`}>
                                    <AppTextInput
                                        className="flex-1 px-4 text-gray-900 font-bold text-base"
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#9CA3AF"
                                        value={name}
                                        onChangeText={setName}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField('')}
                                        autoCapitalize="words"
                                        containerStyle={{ flex: 1, height: 60 }}
                                    />
                                </View>
                            </View>

                            <View className="mb-8">
                                <Text className="text-gray-700 font-medium text-sm mb-3 ml-1">
                                    Age
                                </Text>
                                <View className={`bg-white rounded-2xl border-2 h-16 ${focusedField === 'age'
                                    ? 'border-blue-500'
                                    : 'border-gray-100'
                                    }`}>
                                    <TextInput
                                        className="flex-1 px-4 text-gray-900 font-bold text-base"
                                        placeholder="XX"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={age}
                                        onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
                                        onFocus={() => setFocusedField('age')}
                                        onBlur={() => setFocusedField('')}
                                        selectionColor="#3B82F6"
                                        maxLength={3}
                                        style={{
                                            textAlignVertical: 'center',
                                            paddingVertical: 0,
                                            includeFontPadding: false
                                        }}
                                    />
                                </View>
                            </View>

                            <View className="mb-8">
                                <Text className="text-gray-700 font-medium text-sm mb-3 ml-1">
                                    Phone Number
                                </Text>
                                <View className="bg-gray-50 rounded-2xl border-2 border-transparent">
                                    <View className="px-4 py-4 flex-row items-center">
                                        <Text className="text-gray-400 font-bold text-base">
                                            +88{user?.phone || dbUser?.phone}
                                        </Text>
                                        <View className="ml-auto bg-gray-100 px-3 py-1 rounded-full">
                                            <Text className="text-gray-400 font-bold text-[10px] uppercase">Verified</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text className="text-gray-400 font-medium text-xs mt-2 ml-1">
                                    Phone number cannot be changed for security reasons.
                                </Text>
                            </View>
                        </View>

                        {/* Save Button */}
                        <View className="pb-12">
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={loading || !isChanged || !isValid}
                                className={`h-16 rounded-2xl items-center justify-center shadow-lg ${isChanged && isValid && !loading
                                    ? 'bg-blue-500 shadow-blue-200'
                                    : 'bg-gray-200 shadow-none'
                                    }`}
                            >
                                <View className="flex-row items-center justify-center">
                                    {loading ? (
                                        <>
                                            <ActivityIndicator color="#ffffff" size="small" />
                                            <Text className="text-white font-bold text-lg ml-3">
                                                Saving Changes...
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-white font-bold text-lg">
                                            Save Changes
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Pressable>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
