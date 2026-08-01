import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface LogoutConfirmModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
    visible,
    onClose,
    onConfirm,
}) => {
    const { t } = useTranslation();
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;

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
                    className="bg-white rounded-[32px] p-6 w-full items-center"
                >
                    <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
                        <Ionicons name="log-out-outline" size={30} color="#EF4444" />
                    </View>

                    <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                        {t('profile.logoutTitle')}
                    </Text>
                    <Text className="text-gray-500 font-medium text-center mb-6 leading-6 px-2">
                        {t('profile.logoutConfirm')}
                    </Text>

                    <TouchableOpacity
                        onPress={onConfirm}
                        activeOpacity={0.85}
                        className="w-full bg-red-500 py-4 rounded-2xl items-center mb-3"
                    >
                        <Text className="text-white font-bold text-base">
                            {t('profile.logout')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        activeOpacity={0.8}
                        className="w-full py-3.5 rounded-2xl items-center bg-gray-100"
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
