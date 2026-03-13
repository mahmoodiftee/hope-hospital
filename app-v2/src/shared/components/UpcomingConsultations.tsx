import React, { useRef, useState } from 'react';
import { FlatList, Image, Text, View, Dimensions, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transformAppointmentToDoctorType } from '../utils/formatters';
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
    const flatListRef = useRef<FlatList<DoctorType>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const doctors: DoctorType[] = upcomingAppointments.map(transformAppointmentToDoctorType);
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
                        width: effectiveCardWidth
                    }
                ]}
            >
                {/* Header: Time and Status */}
                <View style={styles.cardHeader}>
                    <View style={styles.timeBadge}>
                        <Ionicons name="time" size={16} color="#3B82F6" />
                        <Text style={styles.timeText} numberOfLines={1}>{doctor.time}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Confirmed</Text>
                    </View>
                </View>

                {/* Body: Doctor Info & Location */}
                <View style={styles.cardBody}>
                    <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName} numberOfLines={1}>{doctor.name}</Text>
                        <Text style={styles.specialtyText} numberOfLines={1}>{doctor.specialization}</Text>

                        <View style={styles.locationContainer}>
                            <Ionicons name="location" size={13} color="#9CA3AF" />
                            <Text style={styles.locationText} numberOfLines={1}>{doctor.location}</Text>
                        </View>
                    </View>

                    {/* Action Icon */}
                    <View style={styles.actionButton}>
                        <Ionicons name="call" size={20} color="#fff" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <HeaderText title="Upcoming Consultation" />
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
                    <HeaderText title="Upcoming Consultation" />
                </View>
                <EmptyAppointmentCard />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <HeaderText title="Upcoming Consultation" />
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
                    paddingBottom: 12,
                    paddingTop: 8,
                }}
                bounces={Platform.OS === 'ios'}
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
        marginBottom: 10,
        marginTop: 0,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 0,
        paddingHorizontal: 16,
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
