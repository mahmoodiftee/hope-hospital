import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
    SlideOutUp,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

const LANGUAGE_SELECTED_KEY = 'language_selected';

export const LanguageSelectionModal = () => {
    const { i18n } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [selected, setSelected] = useState<'en' | 'bn' | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        checkIfLanguageSelected();
    }, []);

    const checkIfLanguageSelected = async () => {
        try {
            const hasSelected = await SecureStore.getItemAsync(LANGUAGE_SELECTED_KEY);
            if (!hasSelected) setTimeout(() => setIsVisible(true), 400);
        } catch {
            setIsVisible(true);
        }
    };

    const handleSelect = async (lang: 'en' | 'bn') => {
        if (isClosing) return;
        setSelected(lang);

        // Step 1: show checkmark for 600ms
        setTimeout(() => {
            setIsClosing(true);

            // Step 2: close immediately after icon SlideOutUp finishes (250ms)
            setTimeout(async () => {
                try {
                    await i18n.changeLanguage(lang);
                    await SecureStore.setItemAsync(LANGUAGE_SELECTED_KEY, 'true');
                    setIsVisible(false);
                } catch (e) {
                    console.error(e);
                }
            }, 250); // matches SlideOutUp duration exactly
        }, 600);
    };

    if (!isVisible) return null;

    return (
        <Modal transparent visible={isVisible} animationType="none" statusBarTranslucent>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            <Animated.View
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(250)}
                style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 24 }}
            >
                {/* ── Icon + titles ── */}
                <Animated.View
                    entering={SlideInDown.delay(100).duration(500).springify()}
                    exiting={SlideOutUp.duration(250)} // ← slides UP and out
                    style={{ alignItems: 'center', marginBottom: 48 }}
                >
                    <View style={{
                        width: 88, height: 88,
                        borderRadius: 28,
                        backgroundColor: selected ? '#F0FDF4' : '#EFF6FF',
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: 24,
                        shadowColor: selected ? '#22C55E' : '#3B82F6',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.18,
                        shadowRadius: 20,
                        elevation: 8,
                    }}>
                        {selected ? (
                            <Animated.View entering={ZoomIn.duration(300).springify()}>
                                <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
                            </Animated.View>
                        ) : (
                            <Animated.View exiting={ZoomOut.duration(150)}>
                                <Ionicons name="language-outline" size={44} color="#3B82F6" />
                            </Animated.View>
                        )}
                    </View>

                    <Text style={{
                        fontSize: 26,
                        fontFamily: 'Quicksand-Bold',
                        color: '#0F172A',
                        textAlign: 'center',
                        marginBottom: 6,
                        letterSpacing: -0.3,
                    }}>
                        {selected ? (selected === 'en' ? 'English Selected' : 'বাংলা নির্বাচিত') : 'Choose Language'}
                    </Text>
                    <Text style={{
                        fontSize: 22,
                        fontFamily: 'Quicksand-Bold',
                        color: '#0F172A',
                        textAlign: 'center',
                        marginBottom: 12,
                    }}>
                        {selected ? '' : 'ভাষা নির্বাচন করুন'}
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        fontFamily: 'Quicksand-Medium',
                        color: '#94A3B8',
                        textAlign: 'center',
                        lineHeight: 22,
                        maxWidth: 360,
                    }}>
                        {selected
                            ? (selected === 'en' ? 'Taking you in...' : 'প্রবেশ করছি...')
                            : 'Select your preferred language to continue.\nআপনার পছন্দের ভাষা বেছে নিন।'
                        }
                    </Text>
                </Animated.View>

                {/* ── Language cards ── */}
                <Animated.View
                    entering={SlideInDown.delay(220).duration(500).springify()}
                    exiting={SlideOutDown.duration(250)}
                    style={{ width: '100%', gap: 14 }}
                >
                    {/* English */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleSelect('en')}
                        disabled={!!selected}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: selected === 'en' ? '#3B82F6' : '#fff',
                            borderRadius: 20,
                            padding: 20,
                            borderWidth: 1.5,
                            borderColor: selected === 'en' ? '#3B82F6' : '#E2E8F0',
                            opacity: selected === 'bn' ? 0.4 : 1,
                            shadowColor: selected === 'en' ? '#3B82F6' : '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: selected === 'en' ? 0.25 : 0.04,
                            shadowRadius: 12,
                            elevation: selected === 'en' ? 8 : 2,
                        }}
                    >
                        <View style={{
                            width: 48, height: 48, borderRadius: 14,
                            backgroundColor: selected === 'en' ? 'rgba(255,255,255,0.2)' : '#EFF6FF',
                            alignItems: 'center', justifyContent: 'center',
                            marginRight: 16,
                        }}>
                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Quicksand-Bold',
                                color: selected === 'en' ? '#fff' : '#3B82F6',
                                letterSpacing: 0.5,
                            }}>EN</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'Quicksand-Bold',
                                color: selected === 'en' ? '#fff' : '#0F172A',
                                marginBottom: 2,
                            }}>
                                English
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                fontFamily: 'Quicksand-Medium',
                                color: selected === 'en' ? 'rgba(255,255,255,0.7)' : '#94A3B8',
                            }}>
                                Continue in English
                            </Text>
                        </View>
                        <View style={{
                            width: 32, height: 32, borderRadius: 16,
                            backgroundColor: selected === 'en' ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Ionicons
                                name={selected === 'en' ? 'checkmark' : 'chevron-forward'}
                                size={16}
                                color={selected === 'en' ? '#fff' : '#94A3B8'}
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Bengali */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleSelect('bn')}
                        disabled={!!selected}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: selected === 'bn' ? '#3B82F6' : '#fff',
                            borderRadius: 20,
                            padding: 20,
                            borderWidth: 1.5,
                            borderColor: selected === 'bn' ? '#3B82F6' : '#E2E8F0',
                            opacity: selected === 'en' ? 0.4 : 1,
                            shadowColor: selected === 'bn' ? '#3B82F6' : '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: selected === 'bn' ? 0.25 : 0.04,
                            shadowRadius: 12,
                            elevation: selected === 'bn' ? 8 : 2,
                        }}
                    >
                        <View style={{
                            width: 48, height: 48, borderRadius: 14,
                            backgroundColor: selected === 'bn' ? 'rgba(255,255,255,0.2)' : '#EFF6FF',
                            alignItems: 'center', justifyContent: 'center',
                            marginRight: 16,
                        }}>
                            <Text style={{
                                fontSize: 15,
                                fontFamily: 'Quicksand-Bold',
                                color: selected === 'bn' ? '#fff' : '#3B82F6',
                                letterSpacing: 0.5,
                            }}>বাং</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'Quicksand-Bold',
                                color: selected === 'bn' ? '#fff' : '#0F172A',
                                marginBottom: 2,
                            }}>
                                বাংলা
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                fontFamily: 'Quicksand-Medium',
                                color: selected === 'bn' ? 'rgba(255,255,255,0.7)' : '#94A3B8',
                            }}>
                                বাংলায় চালিয়ে যান
                            </Text>
                        </View>
                        <View style={{
                            width: 32, height: 32, borderRadius: 16,
                            backgroundColor: selected === 'bn' ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Ionicons
                                name={selected === 'bn' ? 'checkmark' : 'chevron-forward'}
                                size={16}
                                color={selected === 'bn' ? '#fff' : '#94A3B8'}
                            />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Bottom note */}
                <Animated.View
                    entering={FadeIn.delay(400).duration(400)}
                    exiting={FadeOut.duration(150)}
                    style={{ marginTop: 32, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                    <Ionicons name="settings-outline" size={13} color="#CBD5E1" />
                    <Text style={{
                        fontSize: 12,
                        fontFamily: 'Quicksand-Medium',
                        color: '#CBD5E1',
                    }}>
                        You can change this later in Settings
                    </Text>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};