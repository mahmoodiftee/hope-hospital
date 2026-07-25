import React, { useRef, useState } from 'react';
import { FlatList, Image, Text, View, Dimensions, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { transformAppointmentToDoctorType } from '../utils/formatters';
import { formatLocalizedTime, getTranslatedField } from '../utils/translation';
import { HeaderText } from './HeaderText';
import EmptyAppointmentCard from './EmptyAppointmentCard';
import { Appointment } from '../types';

const { width } = Dimensions.get('window');
const SPACING = 16;
// Leaves a tiny peek of the next card
const CARD_WIDTH = width - (SPACING * 4.5);
const SINGLE_CARD_WIDTH = width - (SPACING * 2);

type DoctorType = ReturnType<typeof transformAppointmentToDoctorType>;

interface UpcomingConsultationsProps {
    upcomingAppointments: Appointment[];
    loading?: boolean;
    onPressCard?: (appointment: Appointment) => void;
}

export const UpcomingConsultations = ({
    upcomingAppointments,
    loading = false,
    onPressCard
}: UpcomingConsultationsProps) => {
    const { t } = useTranslation();
    const flatListRef = useRef<FlatList<DoctorType>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { i18n } = useTranslation();

    const doctors: DoctorType[] = upcomingAppointments.map((app, idx) => transformAppointmentToDoctorType(app, idx, i18n.language));
    const isSingle = doctors.length === 1;
    const effectiveCardWidth = isSingle ? SINGLE_CARD_WIDTH : CARD_WIDTH;

    const onScroll = (event: any) => {
        const slideSize = effectiveCardWidth + SPACING;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        if (index >= 0 && index < doctors.length) {
            setCurrentIndex(index);
        }
    };

    const renderDoctorCard = ({ item: doctor, index }: { item: DoctorType, index: number }) => {
        const isLast = index === doctors.length - 1;
        const originalAppointment = upcomingAppointments[index];

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPressCard?.(originalAppointment)}
                style={[
                    styles.cardContainer,
                    {
                        marginRight: isLast ? 0 : SPACING,
                        width: effectiveCardWidth,
                        backgroundColor: '#fff',
                        borderRadius: 28,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#EBF2FF',
                        shadowColor: '#3B82F6',
                        shadowOpacity: 0.10,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 3,
                    }
                ]}
            >
                {/* Header: Time and Status */}
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-2xl border border-blue-100/30">
                        <View className="mr-2">
                            <Ionicons name="calendar-outline" size={10} color="#3B82F6" />
                        </View>
                        <Text className="text-blue-700 font-bold text-xs">{formatLocalizedTime(doctor.time, i18n.language)}</Text>
                    </View>
                    <View className="bg-emerald-50 px-3 py-[6.5px] rounded-xl flex-row items-center border border-emerald-100/50">
                        <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-sm shadow-emerald-400" />
                        <Text className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest">{t("confirmed")}</Text>
                    </View>
                </View>

                {/* Body: Doctor Info */}
                <View className="flex-row items-center mb-3">
                    <View className="relative">
                        <Image source={{ uri: doctor.image }} className="w-16 h-16 rounded-[20px] bg-gray-100 border-2 border-white shadow-sm" />
                        <View className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full ">
                            <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
                        </View>
                    </View>
                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-gray-900 font-bold text-lg leading-tight mb-1" numberOfLines={1}>{getTranslatedField(doctor, 'name', i18n.language)}</Text>
                        <View className="bg-blue-50 self-start px-2 py-0.5 rounded-lg ">
                            <Text className="text-blue-600 font-semibold text-[11px]" numberOfLines={1}>{getTranslatedField(doctor, 'specialization', i18n.language)}</Text>
                        </View>
                    </View>

                </View>

                {/* Footer: Location */}
                <View className="flex-row items-center justify-between border-t border-gray-50 pt-4">
                    <View className="flex-row items-center flex-1 mr-2">
                        <View className="bg-blue-50 p-1 px-1.5 rounded-lg mr-2.5">
                            <Ionicons name="location-sharp" size={12} color="#3B82F6" />
                        </View>
                        <Text className="text-gray-500 font-medium text-sm flex-1" numberOfLines={1}>
                            {doctor.location}
                        </Text>
                    </View>
                    <View className="bg-gray-50 p-1 px-1.5 rounded-lg">
                        <Ionicons name="chevron-forward" size={12} color="#9CA3AF" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <HeaderText title={t("upcomingConsultation")} />
                </View>
                <View style={[styles.cardContainer, styles.skeletonCard]}>
                    <View style={styles.skeletonHeader} />
                    <View style={styles.skeletonBody} />
                </View>
            </View>
        );
    }

    if (!upcomingAppointments || upcomingAppointments.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <HeaderText title={t("upcomingConsultation")} />
                </View>
                <EmptyAppointmentCard />
            </View>
        );
    }

    return (
        <View className="mb-6">
            <View className="flex-row justify-between px-1 mb-2">
                <HeaderText title={t("upcomingConsultation")} className="mb-0" />
            </View>

            <FlatList
                ref={flatListRef}
                data={doctors}
                renderItem={renderDoctorCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                snapToInterval={isSingle ? undefined : effectiveCardWidth + SPACING}
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 16,
                    paddingTop: 8,
                }}
                style={{ marginHorizontal: -16 }}
                bounces={Platform.OS === 'ios'}
                removeClippedSubviews={false}
            />

            {doctors.length > 1 && (
                <View style={[styles.dotContainer, { marginTop: 0, paddingHorizontal: 16 }]}>
                    {doctors.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {

    },
    headerRow: {

    },
    cardContainer: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        paddingBottom: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    skeletonCard: {
        height: 140,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
    },
    skeletonHeader: {
        height: 30,
        width: '50%',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        marginBottom: 20,
    },
    skeletonBody: {
        height: 56,
        width: '100%',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 12,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    timeText: {
        fontFamily: 'Quicksand-Bold',
        fontSize: 13,
        color: '#1D4ED8',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingRight: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    statusText: {
        fontFamily: 'Quicksand-Medium',
        fontSize: 13,
        color: '#4B5563',
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    doctorImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 14,
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
        borderColor: '#EFF6FF',
    },
    doctorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    doctorName: {
        fontFamily: 'Quicksand-Bold',
        fontSize: 17,
        color: '#111827',
        marginBottom: 2,
    },
    specialtyText: {
        fontFamily: 'Quicksand-Medium',
        fontSize: 13,
        color: '#3B82F6',
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontFamily: 'Quicksand-Medium',
        fontSize: 12,
        color: '#9CA3AF',
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        shadowColor: '#3B82F6',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        gap: 6,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    activeDot: {
        width: 20,
        backgroundColor: '#3B82F6',
    },
    inactiveDot: {
        width: 6,
        backgroundColor: '#D1D5DB',
    },
});
