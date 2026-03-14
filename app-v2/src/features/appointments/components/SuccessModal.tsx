import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, Easing, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    visible,
    onClose,
    title,
    message,
}) => {
    const { t } = useTranslation();
    const displayTitle = title || t('appointments.success.bookingConfirmed');
    const displayMessage = message || t('appointments.success.bookingMessage', { doctorName: 'the doctor', date: '', time: '' }); // Fallback

    // Note: SuccessModal is usually called with specific title/message from AppointmentsScreen.
    // If not, it uses these defaults.
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    tension: 120,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <Animated.View
                style={{ opacity: opacityAnim }}
                className="flex-1 bg-black/50 justify-center items-center px-8"
            >
                <Animated.View
                    style={{ transform: [{ scale: scaleAnim }] }}
                    className="bg-white rounded-3xl p-8 items-center w-full"
                >
                    <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                        <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                    </View>

                    <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
                        {displayTitle}
                    </Text>
                    <Text className="text-gray-500 font-medium text-center mb-8 leading-6">
                        {displayMessage}
                    </Text>

                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-blue-500 w-full py-4 rounded-2xl items-center"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">{t('appointments.success.done')}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};
