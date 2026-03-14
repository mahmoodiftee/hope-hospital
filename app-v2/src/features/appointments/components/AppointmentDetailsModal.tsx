import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    PanResponder,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Phone, User, X, XCircle, Star } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { Appointment } from '@/shared/types';
import { useAuth } from '@/features/auth';
import { useAppointmentStore } from '../stores/appointment.store';
import { useNotificationStore } from '@/features/notifications';
import { AppointmentService } from '../services/appointment.service';
import { parseAppointmentDateTime } from '@/shared/utils/timeUtils';
import { getTranslatedField, formatLocalizedNumber, formatLocalizedTime, getTranslatedSpecialties } from '@/shared/utils/translation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { images } from '@/shared/components';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAG_CLOSE_THRESHOLD = 120;

interface AppointmentDetailsModalProps {
    appointment: Appointment;
    visible: boolean;
    onClose: () => void;
    onReschedule: () => void;
    onWriteReview: () => void;
    onRefresh: () => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
    appointment,
    visible,
    onClose,
    onReschedule,
    onWriteReview,
    onRefresh,
}) => {
    const { t, i18n } = useTranslation();
    const { user, dbUser } = useAuth();
    const { cancelAppointment } = useAppointmentStore();
    const { refreshUnreadCount, fetchNotifications } = useNotificationStore();

    const [showModal, setShowModal] = useState(visible);
    const [isLoading, setIsLoading] = useState(false);

    // Animation values
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const dragY = useRef(new Animated.Value(0)).current;

    const userId = user?.id || dbUser?.$id || '';
    const isCancelled = appointment.status === 'Cancelled';
    const isCompleted = appointment.status === 'Completed';
    const isUpcoming = useMemo(() => {
        if (isCancelled || isCompleted) return false;
        return parseAppointmentDateTime(appointment.date, appointment.time) > new Date();
    }, [appointment.date, appointment.time, isCancelled, isCompleted]);

    // ── Drag to close pan responder ────────────────────────────────────────
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
            onPanResponderMove: (_, gs) => {
                if (gs.dy > 0) dragY.setValue(gs.dy);
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > DRAG_CLOSE_THRESHOLD || gs.vy > 0.8) {
                    closeModal();
                } else {
                    Animated.spring(dragY, { toValue: 0, useNativeDriver: true, tension: 100 }).start();
                }
            },
        })
    ).current;

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 280, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
            Animated.timing(dragY, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]).start(() => {
            setShowModal(false);
            onClose();
        });
    };

    useEffect(() => {
        if (visible) {
            dragY.setValue(0);
            setShowModal(true);
            Animated.parallel([
                Animated.spring(translateY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        } else if (!visible && showModal) {
            closeModal();
        }
    }, [visible]);

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return dateStr; }
    };

    const handleCancel = async () => {
        if (isLoading || !appointment.$id) return;
        setIsLoading(true);
        try {
            await cancelAppointment(appointment.$id);
            if (userId) {
                await AppointmentService.createNotification({
                    userId,
                    type: 'appointment_cancelled',
                    title: t('appointments.details.notification.cancelledTitle'),
                    title_bn: t('appointments.details.notification.cancelledTitle', { lng: 'bn' }),
                    message: t('appointments.details.notification.cancelledMessage', { doctorName: getTranslatedField(appointment, 'doctor_name', 'en') }),
                    message_bn: t('appointments.details.notification.cancelledMessage', {
                        lng: 'bn',
                        doctorName: getTranslatedField(appointment, 'doctor_name', 'bn')
                    }),
                    priority: 3,
                    appointmentId: appointment.$id,
                    metadata: {
                        doctorName: appointment.doctor_name,
                        doctorName_bn: appointment.doctor_name_bn,
                        specialty: appointment.specialty,
                        specialty_bn: appointment.specialty_bn,
                        date: appointment.date,
                        time: appointment.time,
                        amount: appointment.amount,
                    },
                });
                await refreshUnreadCount(userId);
                await fetchNotifications(userId);
            }
            onRefresh();
            toast.success(t('appointments.details.cancelSuccess'));
        } catch {
            toast.error(t('appointments.details.cancelError'));
        } finally {
            setIsLoading(false);
            closeModal();
        }
    };
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

    // Status config
    const getStatusConfig = () => {
        if (isCancelled) return { label: 'Cancelled', bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' };
        if (isCompleted) return { label: 'Completed', bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' };
        return { label: 'Upcoming', bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' };
    };
    const statusConfig = getStatusConfig();

    if (!showModal) return null;

    return (
        <Modal transparent visible={showModal} animationType="none" statusBarTranslucent>
            {/* Backdrop */}
            <Animated.View
                style={{ opacity, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }}
            >
                <TouchableOpacity style={{ flex: 1 }} onPress={closeModal} activeOpacity={1} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                style={{
                    transform: [{ translateY: Animated.add(translateY, dragY) }],
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    maxHeight: '85%',
                    shadowColor: '#000',
                    shadowOpacity: 0.2,
                    shadowRadius: 30,
                    shadowOffset: { width: 0, height: -8 },
                    elevation: 24,
                }}
            >
                <View {...panResponder.panHandlers} style={{ paddingTop: 12, paddingBottom: 8, alignItems: 'center' }}>
                    <View style={{ width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 26 }}>
                        <Text style={{ fontSize: 18, fontFamily: 'Quicksand-Bold', color: '#111827' }}>
                            {t('appointmentDetails.title')}
                        </Text>
                    </View>

                    {/* ── Doctor Hero Card ── */}
                    <View style={{
                        marginHorizontal: 20,
                        borderRadius: 24,
                        padding: 10,
                        backgroundColor: '#f9f9f9',
                        borderWidth: 1.5,
                        borderColor: '#f2f2f2',
                        marginBottom: 16,
                        alignItems: 'center',
                    }}>
                        {/* Status pill */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', gap: 6,
                            backgroundColor: statusConfig.bg, paddingHorizontal: 12, paddingVertical: 5,
                            borderRadius: 20, marginBottom: 16, alignSelf: 'flex-end',
                        }}>
                            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: statusConfig.dot }} />
                            <Text style={{ fontSize: 12, fontFamily: 'Quicksand-Bold', color: statusConfig.text }}>
                                {t(`appointmentDetails.status.${(appointment.status || 'upcoming').toLowerCase()}`)}
                            </Text>
                        </View>

                        {/* Doctor image */}
                        {/* @ts-ignore */}
                        {appointment.doctorId?.image ? (
                            <Image
                                //@ts-ignore
                                source={{ uri: appointment.doctorId.image }}
                                style={{ width: 88, height: 88, borderRadius: 44, marginBottom: 12, borderWidth: 3, borderColor: '#fff' }}
                            />
                        ) : (
                            <View style={{
                                width: 88, height: 88, borderRadius: 44, backgroundColor: '#DBEAFE',
                                alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                                borderWidth: 3, borderColor: '#fff',
                            }}>
                                <User size={40} color="#3B82F6" />
                            </View>
                        )}

                        <Text style={{ fontSize: 22, fontFamily: 'Quicksand-Bold', color: '#111827', textAlign: 'center' }}>
                            {getTranslatedField(appointment, 'doctor_name', i18n.language)}
                        </Text>
                        <View style={styles.specialtyRow}>
                            <View style={styles.specialtyBadge}>
                                <SpecialtyIcon specialty={appointment.specialty} />
                                <Text style={styles.specialtyText}>
                                    {getTranslatedField(appointment, 'specialty', i18n.language)}
                                </Text>
                            </View>
                        </View>

                    </View>

                    {/* ── Details Grid ── */}
                    <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
                        <SectionLabel>{t('appointments.details.appointmentInfo')}</SectionLabel>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                            <DetailCard
                                icon={<Calendar size={14} color="#000000" />}
                                iconBg="#f2f2f2"
                                label={t('appointments.details.date')}
                                value={formatDate(appointment.date)}
                            />
                            <DetailCard
                                icon={<Clock size={14} color="#000000" />}
                                iconBg="#f2f2f2"
                                label={t('appointments.details.time')}
                                value={formatLocalizedTime(appointment.time, i18n.language)}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <DetailCard
                                icon={<User size={14} color="#000000" />}
                                iconBg="#f2f2f2"
                                label={t('appointments.details.patient')}
                                value={`${appointment.patient_name}, ${formatLocalizedNumber(appointment.patient_age, i18n.language)}`}
                            />
                            <DetailCard
                                icon={<Phone size={14} color="#000000" />}
                                iconBg="#f2f2f2"
                                label={t('appointments.details.contact')}
                                value={appointment.contactNumber}
                            />
                        </View>
                    </View>

                    {/* ── Fee Card ── */}
                    <View style={{
                        marginHorizontal: 20, marginBottom: 16,
                        backgroundColor: '#f9f9f9', borderRadius: 16,
                        borderWidth: 1, borderColor: '#f2f2f2', padding: 16,
                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <View>
                            <Text style={{ fontSize: 12, fontFamily: 'Quicksand-Medium', color: '#71767f', marginBottom: 4 }}>
                                {t('appointments.details.consultationFee')}
                            </Text>
                            <Text style={{ fontSize: 22, fontFamily: 'Quicksand-Bold', color: '#111827' }}>
                                ৳{formatLocalizedNumber(appointment.amount, i18n.language)}
                            </Text>
                        </View>
                        <View style={{
                            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                            backgroundColor: isCancelled ? '#FEF2F2' : '#F0FDF4',
                            borderColor: isCancelled ? '#FCA5A5' : '#86EFAC',
                            borderWidth: 1,
                        }}>
                            <Text style={{
                                fontSize: 13, fontFamily: 'Quicksand-Bold',
                                color: isCancelled ? '#DC2626' : '#16A34A',
                            }}>
                                {isCancelled ? t('appointments.details.refunded') : t('appointments.details.paid')}
                            </Text>
                        </View>
                    </View>

                    {/* ── Specialties ── */}
                    {/* @ts-ignore */}
                    {appointment.doctorId?.specialties && (
                        <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
                            <SectionLabel>{t('appointments.details.specializations')}</SectionLabel>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {/* @ts-ignore */}
                                {getTranslatedSpecialties(appointment.doctorId, i18n.language).map((s: string, i: number) => (
                                    <View key={i} style={{
                                        backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6,
                                        borderRadius: 20, borderWidth: 1, borderColor: '#BFDBFE',
                                    }}>
                                        <Text style={{ fontSize: 12, fontFamily: 'Quicksand-Bold', color: '#2563EB' }}>
                                            {s.split(' - ')[0]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ── Bio ── */}
                    {/* @ts-ignore */}
                    {appointment.doctorId?.experience && (
                        <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                            <SectionLabel>{t('appointments.details.aboutDoctor')}</SectionLabel>
                            <Text style={{ fontSize: 14, fontFamily: 'Quicksand-Medium', color: '#6B7280', lineHeight: 22 }}>
                                {/* @ts-ignore */}
                                {getTranslatedField(appointment.doctorId, 'experience', i18n.language)}
                            </Text>
                        </View>
                    )}

                    {/* ── Cancelled notice ── */}
                    {isCancelled && (
                        <View style={{
                            marginHorizontal: 20, marginBottom: 16,
                            backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
                            borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
                        }}>
                            <XCircle size={20} color="#DC2626" />
                            <Text style={{ fontSize: 14, fontFamily: 'Quicksand-Bold', color: '#DC2626', flex: 1 }}>
                                {t('appointments.details.cancelledNotice')}
                            </Text>
                        </View>
                    )}

                    {/* ── Action Buttons ── */}
                    <View style={{ marginHorizontal: 20 }}>
                        {isCancelled ? (
                            <ActionButton
                                label={t('appointments.details.bookNew')}
                                variant="primary"
                                onPress={onReschedule}
                            />
                        ) : isUpcoming ? (
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <ActionButton
                                    label={isLoading ? t('appointments.details.cancelling') : t('appointments.details.cancel')}
                                    variant="danger"
                                    onPress={handleCancel}
                                    disabled={isLoading}
                                    flex
                                />
                                <ActionButton
                                    label={t('appointments.details.reschedule')}
                                    variant="primary"
                                    onPress={onReschedule}
                                    disabled={isLoading}
                                    flex
                                />
                            </View>
                        ) : (
                            <ActionButton
                                label={t('appointments.details.writeReview')}
                                variant="review"
                                onPress={onWriteReview}
                                icon={<Star size={16} color="#D97706" fill="#D97706" />}
                            />
                        )}
                    </View>
                </ScrollView>
            </Animated.View>
        </Modal>
    );
};

// ── Sub-components ─────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <View style={{ width: 3, height: 16, backgroundColor: '#3B82F6', borderRadius: 2 }} />
        <Text style={{ fontSize: 13, fontFamily: 'Quicksand-Bold', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {children}
        </Text>
    </View>
);

const DetailCard: React.FC<{
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: string;
}> = ({ icon, iconBg, label, value }) => (
    <View style={{
        flex: 1, backgroundColor: '#f9f9f9', borderRadius: 16,
        padding: 14, borderWidth: 1, borderColor: '#f2f2f2',
    }}>
        <View style={{
            width: 30, height: 30, borderRadius: 10, backgroundColor: iconBg,
            alignItems: 'center', justifyContent: 'center', marginBottom: 8,
        }}>
            {icon}
        </View>
        <Text style={{ fontSize: 11, fontFamily: 'Quicksand-Medium', color: '#71767f', marginBottom: 3 }}>
            {label}
        </Text>
        <Text style={{ fontSize: 13, fontFamily: 'Quicksand-Bold', color: '#111827' }} numberOfLines={2}>
            {value}
        </Text>
    </View>
);

const ActionButton: React.FC<{
    label: string;
    variant: 'primary' | 'danger' | 'review';
    onPress: () => void;
    disabled?: boolean;
    flex?: boolean;
    icon?: React.ReactNode;
}> = ({ label, variant, onPress, disabled, flex, icon }) => {
    const styles = {
        primary: { bg: '#3B82F6', text: '#fff', border: '#3B82F6', shadow: '#3B82F6' },
        danger: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', shadow: 'transparent' },
        review: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', shadow: 'transparent' },
    }[variant];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={{
                flex: flex ? 1 : undefined,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                backgroundColor: styles.bg,
                paddingVertical: 15,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: styles.border,
                opacity: disabled ? 0.6 : 1,
                shadowColor: styles.shadow,
                shadowOpacity: variant === 'primary' ? 0.3 : 0,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: variant === 'primary' ? 6 : 0,
            }}
            activeOpacity={0.8}
        >
            {icon}
            <Text style={{ fontSize: 15, fontFamily: 'Quicksand-Bold', color: styles.text }}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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
        fontFamily: 'Quicksand-Bold',
        color: '#1D4ED8',
    },
});