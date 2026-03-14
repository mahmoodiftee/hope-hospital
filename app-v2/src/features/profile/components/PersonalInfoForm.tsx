import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface PersonalInfoFormProps {
    name: string;
    phone: string;
    onEditPress: () => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ name, phone, onEditPress }) => {
    const { t } = useTranslation();
    return (
        <View className="flex-row items-center px-6 py-6 bg-white mx-4 rounded-3xl shadow-sm/10 border border-gray-100">
            <View className="relative">
                <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center border-2 border-blue-100 shadow-sm/10 overflow-hidden">
                    <Image
                        source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=DBEAFE&color=3B82F6&bold=true` }}
                        className="w-full h-full"
                    />
                </View>
                <View className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 border border-gray-100">
                    <BadgeCheck size={20} color="#3B82F6" fill="#EFF6FF" />
                </View>
            </View>

            <View className="flex-1 ml-4 justify-center">
                <Text className="text-xl font-bold text-gray-900 leading-tight">
                    {name || t('profile.guestUser')}
                </Text>
                <Text className="text-gray-400 font-medium text-sm mt-0.5">
                    {phone}
                </Text>

                <TouchableOpacity
                    className="mt-2 self-start px-4 py-1.5 bg-blue-50/50 rounded-full border border-blue-100/50"
                    onPress={onEditPress}
                    activeOpacity={0.7}
                >
                    <Text className="text-blue-600 font-bold text-xs">{t('profile.editProfileButton')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
