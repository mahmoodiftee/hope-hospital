import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface LanguagePickerModalProps {
    visible: boolean;
    onClose: () => void;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
    visible,
    onClose,
}) => {
    const { t, i18n } = useTranslation();
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const current = i18n.language === 'bn' || i18n.language.startsWith('bn') ? 'bn' : 'en';

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 7,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            opacityAnim.setValue(0);
            scaleAnim.setValue(0.92);
        }
    }, [visible]);

    const selectLanguage = async (lang: 'en' | 'bn') => {
        await i18n.changeLanguage(lang);
        onClose();
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <Animated.View
                style={{ opacity: opacityAnim }}
                className="flex-1 bg-black/50 justify-center items-center px-8"
            >
                <TouchableOpacity
                    className="absolute inset-0"
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={{ transform: [{ scale: scaleAnim }] }}
                    className="bg-white rounded-[32px] p-6 w-full"
                >
                    <View className="items-center mb-5">
                        <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center mb-4">
                            <Ionicons name="language" size={28} color="#3B82F6" />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 text-center">
                            {t('profile.language')}
                        </Text>
                        <Text className="text-gray-400 font-medium text-sm text-center mt-1">
                            {t('profile.languageChoose')}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => selectLanguage('en')}
                        activeOpacity={0.85}
                        className={`flex-row items-center rounded-2xl px-4 py-4 mb-3 border ${
                            current === 'en'
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-gray-50 border-gray-100'
                        }`}
                    >
                        <View
                            className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                                current === 'en' ? 'bg-white/20' : 'bg-white'
                            }`}
                        >
                            <Text
                                className={`font-bold text-sm ${
                                    current === 'en' ? 'text-white' : 'text-gray-700'
                                }`}
                            >
                                EN
                            </Text>
                        </View>
                        <Text
                            className={`flex-1 font-bold text-base ${
                                current === 'en' ? 'text-white' : 'text-gray-900'
                            }`}
                        >
                            {t('profile.languageEnglish')}
                        </Text>
                        {current === 'en' && (
                            <Ionicons name="checkmark-circle" size={22} color="#fff" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => selectLanguage('bn')}
                        activeOpacity={0.85}
                        className={`flex-row items-center rounded-2xl px-4 py-4 mb-4 border ${
                            current === 'bn'
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-gray-50 border-gray-100'
                        }`}
                    >
                        <View
                            className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                                current === 'bn' ? 'bg-white/20' : 'bg-white'
                            }`}
                        >
                            <Text
                                className={`font-bold text-sm ${
                                    current === 'bn' ? 'text-white' : 'text-gray-700'
                                }`}
                            >
                                বাং
                            </Text>
                        </View>
                        <Text
                            className={`flex-1 font-bold text-base ${
                                current === 'bn' ? 'text-white' : 'text-gray-900'
                            }`}
                        >
                            {t('profile.languageBangla')}
                        </Text>
                        {current === 'bn' && (
                            <Ionicons name="checkmark-circle" size={22} color="#fff" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        activeOpacity={0.8}
                        className="py-3.5 rounded-2xl items-center bg-gray-100"
                    >
                        <Text className="text-gray-600 font-bold text-base">
                            {t('profile.cancel')}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};
