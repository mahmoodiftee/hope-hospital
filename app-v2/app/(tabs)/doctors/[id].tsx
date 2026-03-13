import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { Stack, router, useGlobalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useDoctorStore } from '@/features/doctors';
import { AppointmentBookingModal } from '@/features/appointments';
import { Doctor } from '@/shared/types';
import { images } from '@/shared/components';
import { useAuth } from '@/features/auth';


const { width } = Dimensions.get('window');

const ReviewCarousel = ({ dbReviews }: { dbReviews?: { rating: number, review: string, patientName: string }[] }) => {
    const mockReviews = [
        { id: '1', user: 'Sarah Johnson', rating: 5, comment: 'Dr. Akhter is incredibly professional and caring. She took the time to explain everything clearly.', date: '2 days ago' },
        { id: '2', user: 'Michael Chen', rating: 4, comment: 'Very thorough checkup. The clinic was clean and the staff was very helpful.', date: '1 week ago' },
        { id: '3', user: 'Emily Davis', rating: 5, comment: 'Best nephrologist I have visited. Highly recommend for any kidney-related issues.', date: '3 weeks ago' },
    ];

    const hasRealReviews = dbReviews && dbReviews.length > 0;
    const items = hasRealReviews
        ? dbReviews.map((r, i) => ({
            id: `real-${i}`,
            user: r.patientName || 'Anonymous',
            rating: r.rating,
            comment: r.review,
            date: 'Recent' // We don't have created at in the type definition explicitly, defaulting to Recent
        }))
        : mockReviews;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScrollContainer}
            snapToInterval={width * 0.75 + 16}
            decelerationRate="fast"
        >
            {items.map((item) => (
                <View key={item.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                        <View style={styles.reviewUser}>
                            <View style={styles.userAvatar}>
                                <Text style={styles.avatarText}>{item.user.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.userName}>{item.user}</Text>
                                <Text style={styles.reviewDate}>{item.date}</Text>
                            </View>
                        </View>
                        <View style={styles.reviewRating}>
                            <Ionicons name="star" size={12} color="#FBBF24" />
                            <Text style={styles.ratingTextSmall}>{item.rating}</Text>
                        </View>
                    </View>
                    <Text style={styles.reviewComment} numberOfLines={3}>{item.comment}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const SpecialtyIcon = ({ specialty }: { specialty: string }) => {
    const s = specialty?.toLowerCase();
    if (s === 'heart') return <Ionicons name="heart" size={18} color="#1D4ED8" />;
    if (s === 'dental') return <MaterialCommunityIcons name="tooth" size={18} color="#1D4ED8" />;
    if (s === 'lungs') return <MaterialCommunityIcons name="lungs" size={18} color="#1D4ED8" />;
    if (s === 'kidney' || s === 'liver') {
        const iconKey = s + 'Icon';
        const source = images[iconKey];
        if (!source) return <Ionicons name="medical" size={18} color="#1D4ED8" />;
        return <Image source={source} style={{ width: 18, height: 18 }} tintColor="#1D4ED8" />;
    }
    return <Ionicons name="medical" size={18} color="#1D4ED8" />;
};

const HeaderRightActions = ({
    isFavorited,
    onToggle
}: {
    isFavorited: boolean;
    onToggle: () => void;
}) => {
    return (
        <TouchableOpacity
            onPress={onToggle}
            style={styles.favoriteButton}
        >
            <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={22}
                color={isFavorited ? "#FF4D67" : "#1F2937"}
            />
        </TouchableOpacity>
    );
};

export default function DoctorDetailScreen() {
    const { id } = useGlobalSearchParams<{ id: string }>();
    const { getDoctorById, isLoading } = useDoctorStore();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [showBooking, setShowBooking] = useState(false);
    const insets = useSafeAreaInsets();
    const { dbUser, toggleFavorite, isAuthenticated } = useAuth();

    // Animation for the arrow icon
    const translateX = useSharedValue(0);

    useEffect(() => {
        translateX.value = withRepeat(
            withSequence(
                withTiming(5, { duration: 600 }),
                withTiming(0, { duration: 600 })
            ),
            -1, // Loop indefinitely
            true // Reverse on each loop
        );
    }, []);

    const animatedArrowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const isFavorited = !!(id && dbUser?.favorites?.includes(id));

    const handleToggleFavorite = () => {
        if (!isAuthenticated) {
            Alert.alert(
                "Login Required",
                "Please login to save doctors to your favorites.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => router.push('/(auth)/sign-in') }
                ]
            );
            return;
        }
        if (id) toggleFavorite(id);
    };

    useEffect(() => {
        const fetch = async () => {
            if (id) {
                const doc = await getDoctorById(id);
                setDoctor(doc);
            }
        };
        fetch();
    }, [id, getDoctorById]);

    // console.log(JSON.stringify(doctor, null, 2));

    if (isLoading || !doctor) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    // Helper to extract years of experience from bio
    const getExperienceYears = (bio: string) => {
        const match = bio?.match(/(\d+)\s+years/i);
        return match ? `${match[1]} Years` : '10+ Years';
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                title: '',
                headerTransparent: true,
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <HeaderRightActions
                        isFavorited={isFavorited}
                        onToggle={handleToggleFavorite}
                    />
                ),
            }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero section with Image */}
                <View style={styles.heroSection}>
                    {doctor.image && (
                        <Image
                            source={{ uri: doctor.image }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    )}
                    <View style={styles.overlay} />
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Header Info */}
                    <View style={styles.headerInfo}>
                        <View style={styles.nameBlock}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={styles.doctorName}>{doctor.name}</Text>
                                <TouchableOpacity
                                    onPress={handleToggleFavorite}
                                    style={styles.saveAction}
                                >
                                    <Ionicons
                                        name={isFavorited ? "bookmark" : "bookmark-outline"}
                                        size={18}
                                        color={isFavorited ? "#FF4D67" : "#6B7280"}
                                    />
                                    <Text style={[styles.saveText, { color: isFavorited ? "#FF4D67" : "#6B7280" }]}>
                                        {isFavorited ? 'Saved' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.specialtyBadge}>
                                <SpecialtyIcon specialty={doctor.specialty} />
                                <Text style={styles.specialtyText}>{doctor.specialty}</Text>
                            </View>
                        </View>
                        {/* <View style={styles.ratingBox}>
                            <Text style={styles.ratingText}>৳ {doctor.hourlyRate}/hr</Text>
                        </View> */}
                    </View>

                    {/* Quick Stats Grid */}
                    {/* <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
                                <Ionicons name="people" size={20} color="#3B82F6" />
                            </View>
                            <Text style={styles.statValue}>1.2k+</Text>
                            <Text style={styles.statLabel}>Patients</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconCircle, { backgroundColor: '#F0FDF4' }]}>
                                <Ionicons name="ribbon" size={20} color="#22C55E" />
                            </View>
                            <Text style={styles.statValue}>{getExperienceYears(doctor.experience)}</Text>
                            <Text style={styles.statLabel}>Exp.</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconCircle, { backgroundColor: '#FFF7ED' }]}>
                                <Ionicons name="chatbubble-ellipses" size={20} color="#F97316" />
                            </View>
                            <Text style={styles.statValue}>120+</Text>
                            <Text style={styles.statLabel}>Reviews</Text>
                        </View>
                    </View> */}


                    {/* About Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About Doctor</Text>
                        <Text style={styles.aboutText}>{doctor.experience}</Text>
                    </View>

                    {/* Review Carousel */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>Reviews</Text>
                            {/* <TouchableOpacity>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity> */}
                        </View>
                        <ReviewCarousel dbReviews={doctor.reviews} />
                    </View>

                    {/* Working Hours / Specialties */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Key Specialties</Text>
                        <View style={styles.specialtiesList}>
                            {doctor?.specialties?.map((s, idx) => (
                                <View key={idx} style={styles.specialtyChip}>
                                    <View style={styles.chipDot} />
                                    <Text style={styles.chipText}>{s}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Action Footer - Fixed for Tab Bar visibility */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 70 : 80) }]}>
                <View style={styles.footerContent}>
                    <View style={styles.priceBlock}>
                        <Text style={styles.priceLabel}>Consultation</Text>
                        <Text style={styles.priceValue}>৳{doctor.hourlyRate}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowBooking(true)}
                        style={styles.bookButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.bookButtonText}>Book Now</Text>
                        <Animated.View style={animatedArrowStyle}>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </View>

            <AppointmentBookingModal
                isVisible={showBooking}
                onClose={() => setShowBooking(false)}
                doctor={{
                    id: doctor.id,
                    name: doctor.name,
                    specialty: doctor.specialty,
                    hourlyRate: doctor.hourlyRate
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
        marginTop: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    favoriteButton: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        marginTop: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    scrollContent: {
        paddingBottom: 120,
    },
    heroSection: {
        height: 440,
        width: width,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    contentCard: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: -130,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    nameBlock: {
        flex: 1,
        marginRight: 16,
    },
    doctorName: {
        fontSize: 24,
        fontFamily: 'Quicksand-Bold',
        color: '#111827',
        marginBottom: 8,
    },
    specialtyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#F0F7FF',
        // paddingHorizontal: 10,
        // paddingVertical: 4,
        // borderRadius: 12,
        alignSelf: 'flex-start',
        gap: 6,
    },
    specialtyText: {
        fontSize: 14,
        fontFamily: 'Quicksand-Bold',
        color: '#1D4ED8',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    ratingText: {
        fontSize: 14,
        fontFamily: 'Quicksand-Bold',
        color: '#92400E',
    },
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAllText: {
        fontSize: 14,
        fontFamily: 'Quicksand-Bold',
        color: '#3B82F6',
    },
    reviewsScrollContainer: {
        paddingRight: 24,
        gap: 16,
        marginBottom: 8
    },
    reviewCard: {
        width: width * 0.75,
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontFamily: 'Quicksand-Bold',
        color: '#0369A1',
    },
    userName: {
        fontSize: 14,
        fontFamily: 'Quicksand-Bold',
        color: '#111827',
    },
    reviewDate: {
        fontSize: 12,
        fontFamily: 'Quicksand-Medium',
        color: '#9CA3AF',
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingTextSmall: {
        fontSize: 12,
        fontFamily: 'Quicksand-Bold',
        color: '#92400E',
    },
    reviewComment: {
        fontSize: 14,
        fontFamily: 'Quicksand-Medium',
        color: '#4B5563',
        lineHeight: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Quicksand-Bold',
        color: '#111827',
        marginBottom: 8,
    },
    aboutText: {
        fontSize: 15,
        fontFamily: 'Quicksand-Medium',
        color: '#4B5563',
        lineHeight: 24,
    },
    specialtiesList: {
        flexDirection: 'column',
        gap: 10,
        marginBottom: 60,
    },
    specialtyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 12,
    },
    chipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#3B82F6',
    },
    chipText: {
        fontSize: 14,
        fontFamily: 'Quicksand-Medium',
        color: '#374151',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceBlock: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 13,
        fontFamily: 'Quicksand-Medium',
        color: '#6B7280',
        marginBottom: 2,
    },
    priceValue: {
        fontSize: 24,
        fontFamily: 'Quicksand-Bold',
        color: '#111827',
    },
    bookButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 20,
        gap: 10,
        elevation: 8,
        shadowColor: '#3B82F6',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    bookButtonText: {
        fontSize: 16,
        fontFamily: 'Quicksand-Bold',
        color: '#fff',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#FCFCFC',
        borderRadius: 24,
        padding: 5,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 15,
        fontFamily: 'Quicksand-Bold',
        color: '#111827',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Quicksand-Medium',
        color: '#6B7280',
    },
    saveAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    saveText: {
        fontSize: 13,
        fontFamily: 'Quicksand-Bold',
    },
});
