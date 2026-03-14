import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Pressable, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth';
import { AuthService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export default function EditProfileScreen() {
    const { t } = useTranslation();
    const { user, dbUser, isAuthenticated } = useAuth();
    const setSession = useAuthStore(state => state.setSession);

    const [name, setName] = useState(dbUser?.name || '');
    const [age, setAge] = useState(dbUser?.age?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string>('');

    const handleSave = async () => {
        if (!name.trim() || !age.trim()) {
            toast.error(t('editProfile.fillAll'));
            return;
        }

        if (parseInt(age) < 1 || parseInt(age) > 120) {
            toast.error(t('editProfile.validAge'));
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

            toast.success(t('editProfile.success'));
            router.back();
        } catch (error) {
            console.error('[EditProfile] Error:', error);
            toast.error(t('editProfile.error'));
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
                                {t('editProfile.title')}
                            </Text>
                            <Text className="text-gray-500 font-medium text-base leading-6">
                                {t('editProfile.subtitle')}
                            </Text>
                        </View>

                        {/* Form */}
                        <View className="flex-1">
                            <View className="mb-6">
                                <Text className="text-gray-700 font-medium text-sm mb-3 ml-1">
                                    {t('editProfile.fullName')}
                                </Text>
                                <View className={`bg-white rounded-2xl border-2 h-16 ${focusedField === 'name'
                                    ? 'border-blue-500'
                                    : 'border-gray-100'
                                    }`}>
                                    <AppTextInput
                                        className="flex-1 px-4 text-gray-900 font-bold text-base"
                                        placeholder={t('editProfile.namePlaceholder')}
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
                                    {t('editProfile.age')}
                                </Text>
                                <View className={`bg-white rounded-2xl border-2 h-16 ${focusedField === 'age'
                                    ? 'border-blue-500'
                                    : 'border-gray-100'
                                    }`}>
                                    <TextInput
                                        className="flex-1 px-4 text-gray-900 font-bold text-base"
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
                                            textAlignVertical: 'center',
                                            paddingVertical: 0,
                                            includeFontPadding: false
                                        }}
                                    />
                                </View>
                            </View>

                            <View className="mb-8">
                                <Text className="text-gray-700 font-medium text-sm mb-3 ml-1">
                                    {t('editProfile.phoneNumber')}
                                </Text>
                                <View className="bg-gray-50 rounded-2xl border-2 border-transparent">
                                    <View className="px-4 py-4 flex-row items-center">
                                        <Text className="text-gray-400 font-bold text-base">
                                            {t('auth.countryCode')}{user?.phone || dbUser?.phone}
                                        </Text>
                                        <View className="ml-auto bg-gray-100 px-3 py-1 rounded-full">
                                            <Text className="text-gray-400 font-bold text-[10px] uppercase">{t('editProfile.verified')}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text className="text-gray-400 font-medium text-xs mt-2 ml-1">
                                    {t('editProfile.phoneChangeNotice')}
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
                                                {t('editProfile.saving')}
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-white font-bold text-lg">
                                            {t('editProfile.save')}
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
