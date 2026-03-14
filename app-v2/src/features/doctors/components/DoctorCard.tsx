import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Doctor } from '@/shared/types';
import { images } from '@/shared/components';
import { useTranslation } from 'react-i18next';
import { getTypographyStyle } from '@/shared/utils/typography';

import { getTranslatedField, formatLocalizedNumber } from '@/shared/utils/translation';

interface DoctorCardProps {
    doctor: Doctor;
    onPress: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

const SpecialtyIcon = ({ specialty }: { specialty: string }) => {
    const s = specialty?.toLowerCase();
    if (s === 'heart') return <Ionicons name="heart" size={14} color="#1D4ED8" />;
    if (s === 'dental') return <MaterialCommunityIcons name="tooth" size={14} color="#1D4ED8" />;
    if (s === 'lungs') return <MaterialCommunityIcons name="lungs" size={14} color="#1D4ED8" />;

    // For kidney and liver, we use the PNG icons
    if (s === 'kidney' || s === 'liver') {
        const iconKey = s + 'Icon';
        const source = images[iconKey];
        if (!source) return <Ionicons name="medical" size={14} color="#1D4ED8" />;
        return (
            <Image
                source={source}
                style={{ width: 14, height: 14 }}
                tintColor="#1D4ED8"
            />
        );
    }

    return <Ionicons name="medical" size={14} color="#1D4ED8" />;
};

export const DoctorCard: React.FC<DoctorCardProps> = ({
    doctor,
    onPress,
    isFavorite = false,
    onToggleFavorite
}) => {
    const { t, i18n } = useTranslation();
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.92}
            style={styles.card}
        >
            {/* Left: Doctor Image with availability badge */}
            <View style={styles.imageContainer}>
                {doctor.image ? (
                    <Image
                        source={{ uri: doctor.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.image, styles.imageFallback]}>
                        <Ionicons name="person" size={36} color="#6B7280" />
                    </View>
                )}

                {onToggleFavorite && (
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onToggleFavorite();
                        }}
                        style={styles.cardFavoriteButton}
                    >
                        <Ionicons
                            name={isFavorite ? "bookmark" : "bookmark-outline"}
                            size={15}
                            color={isFavorite ? "#FF4D67" : "#fff"}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Right: Info */}
            <View style={styles.info}>
                {/* Name */}
                <View style={styles.nameRow}>
                    <Text
                        style={[styles.name, getTypographyStyle('black', 16)]}
                        numberOfLines={1}
                    >
                        {getTranslatedField(doctor, 'name', i18n.language)}
                    </Text>
                    <View style={styles.stat}>
                        <Ionicons name="cash-outline" size={13} color="#9CA3AF" />
                        <Text style={styles.statText}>৳ {formatLocalizedNumber(doctor.hourlyRate, i18n.language)}{t('doctors.perHour')}</Text>
                    </View>
                </View>

                {/* Specialty Badge + Rate */}
                <View style={styles.specialtyRow}>
                    <View style={styles.specialtyBadge}>
                        <SpecialtyIcon specialty={doctor.specialty} />
                        <Text style={[styles.specialtyText, getTypographyStyle('bold', 13)]}>
                            {getTranslatedField(doctor, 'specialty', i18n.language)}
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statText} numberOfLines={2}>
                            {getTranslatedField(doctor, 'experience', i18n.language)?.slice(0, 100)}
                            {getTranslatedField(doctor, 'experience', i18n.language)?.length > 100 ? "..." : ""}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 14,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    imageContainer: {
        position: 'relative',
        marginRight: 14,
    },
    image: {
        width: 76,
        height: 105,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
    },
    imageFallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    availableDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: '#fff',
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    name: {
        fontSize: 16,
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },

    specialtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
        marginTop: 5,
    },
    specialtyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F0FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 6,
    },
    specialtyText: {
        fontSize: 12,
        color: '#1D4ED8',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 5,
    },
    statsRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: '#6B7280',
    },
    statDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 8,
    },
    cardFavoriteButton: {
        position: 'absolute',
        bottom: 3,
        right: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        width: 25,
        height: 25,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
});
