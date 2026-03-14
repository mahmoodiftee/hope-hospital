import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const isBn = i18n.language === 'bn';

    return (
        <View className="flex-row bg-gray-100 rounded-full p-1 px-2 self-start">
            <TouchableOpacity
                onPress={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-full ${!isBn ? 'bg-blue-500' : 'bg-transparent'}`}
            >
                <Text className={`text-sm font-quicksand-medium ${!isBn ? 'text-white' : 'text-gray-500'}`}>
                    EN
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => changeLanguage('bn')}
                className={`px-3 py-1 rounded-full ${isBn ? 'bg-blue-500' : 'bg-transparent'}`}
            >
                <Text className={`text-sm font-quicksand-medium ${isBn ? 'text-white' : 'text-gray-500'}`}>
                    বাং
                </Text>
            </TouchableOpacity>
        </View>
    );
};
