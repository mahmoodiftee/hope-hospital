import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../hooks/useBooking';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { useGuestBooking } from '../hooks/useGuestBooking';
import { OtpInput } from '@/features/auth';
import { CustomButton } from '@/shared/components';
import { TimeSlot, Appointment } from '@/shared/types';
import { SuccessModal } from './SuccessModal';
import { getTodayDateString } from '@/shared/utils/timeUtils';
import { OTP_RESEND_COUNTDOWN_SECONDS } from '@/shared/constants';

interface AppointmentBookingModalProps {
    isVisible: boolean;
    onClose: () => void;
    doctor: { id: string; name: string; specialty: string; hourlyRate: number };
    reschedule?: boolean;
    rescheduleDetails?: Appointment;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
    isVisible,
    onClose,
    doctor,
    reschedule = false,
    rescheduleDetails,
}) => {
    // ── Hooks ──────────────────────────────────────────────────────────────
    const {
        patientInfo: authPatientInfo,
        setPatientInfo: setAuthPatientInfo,
        selectedDate: authSelectedDate,
        setSelectedDate: setAuthSelectedDate,
        selectedTime: authSelectedTime,
        setSelectedTime: setAuthSelectedTime,
        validationErrors: authValidationErrors,
        isLoading: isAuthBookingLoading,
        book,
        isAuthenticated,
        isReschedule,
    } = useBooking(doctor, reschedule ? rescheduleDetails : undefined);

    const {
        patientInfo: guestPatientInfo,
        setPatientInfo: setGuestPatientInfo,
        selectedDate: guestSelectedDate,
        setSelectedDate: setGuestSelectedDate,
        selectedTime: guestSelectedTime,
        setSelectedTime: setGuestSelectedTime,
        validationErrors: guestValidationErrors,
        isLoading: isGuestBookingLoading,
        otp,
        setOtp,
        sendOtp,
        resendOtp,
        verifyAndBook,
        showOtp,
        closeOtp,
        countdown,
        canResend,
    } = useGuestBooking(doctor);

    // ── Unified state switching ────────────────────────────────────────────
    const patientInfo = isAuthenticated ? authPatientInfo : guestPatientInfo;
    const setPatientInfo = isAuthenticated ? setAuthPatientInfo : setGuestPatientInfo;
    const selectedDate = isAuthenticated ? authSelectedDate : guestSelectedDate;
    const setSelectedDate = isAuthenticated ? setAuthSelectedDate : setGuestSelectedDate;
    const selectedTime = isAuthenticated ? authSelectedTime : guestSelectedTime;
    const setSelectedTime = isAuthenticated ? setAuthSelectedTime : setGuestSelectedTime;
    const validationErrors = isAuthenticated ? authValidationErrors : guestValidationErrors;
    const isLoading = isAuthenticated ? isAuthBookingLoading : isGuestBookingLoading;

    // ── Available slots (driven by selected date) ──────────────────────────
    const {
        slots,
        isLoading: isSlotsLoading,
        markedDates,
        isDateAvailable,
    } = useAvailableSlots(doctor.id, selectedDate);

    // ── Success modal ──────────────────────────────────────────────────────
    const [showSuccess, setShowSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState<string>('');

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleBook = async () => {
        if (isAuthenticated) {
            const result = await book();
            if (result) {
                setShowSuccess(true);
                onClose(); // Hide background modal immediately
            }
        } else {
            await sendOtp();
        }
    };

    const handleVerify = async () => {
        const success = await verifyAndBook();
        if (success) {
            setShowSuccess(true);
            onClose(); // Hide background modal immediately
        }
    };

    const handleSuccessDismiss = () => {
        setShowSuccess(false);
        onClose();
    };

    const handleDateSelect = (day: any) => {
        const dateStr = day.dateString;
        if (isDateAvailable(dateStr)) {
            setSelectedDate(dateStr);
            setSelectedTime(''); // Reset time when date changes
        }
    };

    const today = getTodayDateString();

    // ── Reschedule banner ──────────────────────────────────────────────────
    const oldDateLabel = rescheduleDetails?.date
        ? (() => {
            try {
                return new Date(rescheduleDetails.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                });
            } catch { return rescheduleDetails.date; }
        })()
        : '';

    return (
        <>
            <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
                {/* Plain View backdrop — no Pressable/KeyboardAvoidingView which steal scroll gestures */}
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '92%', padding: 24 }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-2xl font-bold text-gray-900">
                                {isReschedule ? 'Reschedule Appointment' : 'Book Appointment'}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={28} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {/* Doctor Info */}
                            <View className="bg-blue-50 p-4 rounded-2xl mb-5">
                                <Text className="text-gray-900 font-bold">{doctor.name}</Text>
                                <Text className="text-gray-500 font-medium">{doctor.specialty}</Text>
                                <Text className="text-blue-600 font-bold mt-1">৳{doctor.hourlyRate} / session</Text>
                            </View>

                            {/* Reschedule Banner */}
                            {isReschedule && rescheduleDetails && (
                                <View className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-5">
                                    <Text className="text-amber-800 font-bold text-sm mb-1">
                                        Rescheduling from:
                                    </Text>
                                    <Text className="text-amber-700 font-medium text-sm">
                                        {oldDateLabel} at {rescheduleDetails.time}
                                    </Text>
                                </View>
                            )}

                            {/* ── Calendar ── */}
                            <Text className="text-gray-900 font-bold mb-3">
                                {isReschedule ? 'Select New Date' : 'Select Date'}
                            </Text>
                            <View className="mb-5 rounded-2xl overflow-hidden border border-gray-100">
                                <Calendar
                                    style={{ borderRadius: 16 }}
                                    minDate={today}
                                    markingType="custom"
                                    markedDates={markedDates}
                                    onDayPress={handleDateSelect}
                                    theme={{
                                        textDayFontFamily: 'Quicksand-Medium',
                                        textMonthFontFamily: 'Quicksand-Bold',
                                        textDayHeaderFontFamily: 'Quicksand-SemiBold',
                                        textDayFontSize: 14,
                                        textMonthFontSize: 16,
                                        textDayHeaderFontSize: 12,
                                        todayTextColor: '#007AFF',
                                        arrowColor: '#007AFF',
                                        calendarBackground: '#ffffff',
                                    }}
                                />
                            </View>
                            {validationErrors.date ? (
                                <Text className="text-red-500 text-xs font-medium -mt-4 mb-4 ml-1">
                                    {validationErrors.date}
                                </Text>
                            ) : null}

                            {/* ── Time Slots ── */}
                            {selectedDate ? (
                                <>
                                    <Text className="text-gray-900 font-bold mb-3">
                                        {isReschedule ? 'Select New Time' : 'Select Time'}
                                    </Text>
                                    {isSlotsLoading ? (
                                        <ActivityIndicator color="#3B82F6" className="my-4" />
                                    ) : (
                                        <View className="flex-row flex-wrap mb-5">
                                            {slots.map((slot: TimeSlot) => (
                                                <TouchableOpacity
                                                    key={slot.id}
                                                    disabled={!slot.available}
                                                    onPress={() => setSelectedTime(slot.time)}
                                                    className={`w-[30%] py-3 rounded-xl mr-[3%] mb-3 border ${selectedTime === slot.time
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : slot.available
                                                            ? 'bg-white border-gray-100'
                                                            : 'bg-gray-50 border-gray-100'
                                                        }`}
                                                >
                                                    <Text
                                                        className={`text-center text-xs font-bold ${selectedTime === slot.time
                                                            ? 'text-white'
                                                            : slot.available
                                                                ? 'text-gray-700'
                                                                : 'text-gray-300'
                                                            }`}
                                                    >
                                                        {slot.time}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                    {validationErrors.time ? (
                                        <Text className="text-red-500 text-xs font-medium -mt-4 mb-4 ml-1">
                                            {validationErrors.time}
                                        </Text>
                                    ) : null}
                                </>
                            ) : (
                                <View className="bg-gray-50 rounded-xl p-4 items-center mb-5">
                                    <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
                                    <Text className="text-gray-400 font-medium mt-2 text-sm">
                                        Select a date to view available time slots
                                    </Text>
                                </View>
                            )}

                            {/* ── Patient Info ── */}
                            <Text className="text-gray-900 font-bold mb-3">Patient Information</Text>

                            <View className="mb-4">
                                <Text className="text-gray-700 font-medium text-sm mb-2 ml-1">
                                    Full Name
                                </Text>
                                <View className={`bg-white rounded-2xl border-2 h-14 justify-center ${focusedField === 'name' ? 'border-blue-500' : 'border-gray-100'
                                    } ${validationErrors.name ? 'border-red-500' : ''}`}>
                                    <AppTextInput
                                        placeholder="Patient's Full Name"
                                        placeholderTextColor="#9CA3AF"
                                        value={patientInfo.name}
                                        onChangeText={(t: any) => setPatientInfo({ ...patientInfo, name: t })}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField('')}
                                        editable={!isReschedule}
                                        containerStyle={{ flex: 1, height: 46 }}
                                    />
                                </View>
                                {validationErrors.name && (
                                    <Text className="text-red-500 font-medium text-xs mt-1 ml-1">
                                        {validationErrors.name}
                                    </Text>
                                )}
                            </View>

                            <View className="flex-row gap-4 mb-4">
                                <View style={{ width: '35%' }}>
                                    <Text className="text-gray-700 font-medium text-sm mb-2 ml-1">
                                        Age
                                    </Text>
                                    <View className={`bg-white rounded-2xl border-2 h-14 ${focusedField === 'age' ? 'border-blue-500' : 'border-gray-100'
                                        } ${validationErrors.age ? 'border-red-500' : ''}`}>
                                        <TextInput
                                            placeholder="Age"
                                            placeholderTextColor="#9CA3AF"
                                            value={patientInfo.age}
                                            onChangeText={(t: any) => setPatientInfo({ ...patientInfo, age: t.replace(/[^0-9]/g, '') })}
                                            onFocus={() => setFocusedField('age')}
                                            onBlur={() => setFocusedField('')}
                                            keyboardType="numeric"
                                            editable={!isReschedule}
                                            selectionColor="#3B82F6"
                                            maxLength={3}
                                            style={{
                                                fontFamily: 'Quicksand-Bold',
                                                fontSize: 16,
                                                color: '#111827',
                                                paddingHorizontal: 16,
                                                height: 46,
                                                paddingVertical: 0,
                                                includeFontPadding: false,
                                                textAlignVertical: 'center',
                                            }}
                                        />
                                    </View>
                                    {validationErrors.age && (
                                        <Text className="text-red-500 font-medium text-xs mt-1 ml-1">
                                            {validationErrors.age}
                                        </Text>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-700 font-medium text-sm mb-2 ml-1">
                                        Phone Number
                                    </Text>
                                    <View className={`bg-white rounded-2xl border-2 h-14 ${focusedField === 'phone' ? 'border-blue-500' : 'border-gray-100'
                                        } ${validationErrors.phone ? 'border-red-500' : ''}`}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 46, paddingHorizontal: 16 }}>
                                            <Text style={{
                                                fontFamily: 'Quicksand-Bold',
                                                fontSize: 16,
                                                color: '#111827',
                                                lineHeight: 20,
                                            }}>
                                                +88
                                            </Text>
                                            <View style={{ width: 1, height: 24, backgroundColor: '#E5E7EB', marginHorizontal: 12 }} />
                                            <TextInput
                                                placeholder="01XXXXXXXXX"
                                                placeholderTextColor="#9CA3AF"
                                                value={patientInfo.phone}
                                                onChangeText={(t) => setPatientInfo({ ...patientInfo, phone: t.replace(/[^0-9]/g, '') })}
                                                onFocus={() => setFocusedField('phone')}
                                                onBlur={() => setFocusedField('')}
                                                keyboardType="phone-pad"
                                                editable={!isReschedule}
                                                selectionColor="#3B82F6"
                                                maxLength={11}
                                                style={{
                                                    flex: 1,
                                                    fontFamily: 'Quicksand-Bold',
                                                    fontSize: 16,
                                                    color: '#111827',
                                                    height: 56,
                                                    paddingVertical: 0,
                                                    includeFontPadding: false,
                                                    textAlignVertical: 'center',
                                                }}
                                            />
                                        </View>
                                    </View>
                                    {validationErrors.phone && (
                                        <Text className="text-red-500 font-medium text-xs mt-1 ml-1">
                                            {validationErrors.phone}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* ── Book Button ── */}
                            <CustomButton
                                title={isReschedule ? 'Reschedule Appointment' : 'Confirm Booking'}
                                onPress={handleBook}
                                isLoading={isLoading}
                                className="mt-6 shadow-lg shadow-blue-200"
                            />

                            {/* Bottom spacer */}
                            <View className="h-8" />
                        </ScrollView>
                    </View>
                </View>

                {/* ── OTP Modal for Guests ── */}
                {showOtp && (
                    <Modal visible={showOtp} transparent animationType="fade">
                        <View className="flex-1 bg-black/60 justify-center p-6">
                            <View className="bg-white rounded-3xl p-8 items-center">
                                <Text className="text-2xl font-bold mb-2">Verify Phone</Text>
                                <Text className="text-gray-400 font-medium text-center mb-6">
                                    We've sent a 6-digit code to {patientInfo.phone}
                                </Text>

                                <OtpInput
                                    value={otp}
                                    onChange={(val, idx) => {
                                        const newOtp = [...otp];
                                        newOtp[idx] = val;
                                        setOtp(newOtp);
                                    }}
                                />

                                {/* Resend countdown */}
                                <View className="mt-4 mb-2">
                                    {canResend ? (
                                        <TouchableOpacity onPress={resendOtp}>
                                            <Text className="text-blue-500 font-bold text-sm">
                                                Resend Code
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text className="text-gray-400 font-medium text-sm">
                                            Resend in {countdown}s
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={handleVerify}
                                    disabled={isGuestBookingLoading}
                                    className={`mt-4 w-full h-14 rounded-2xl items-center justify-center ${isGuestBookingLoading ? 'bg-gray-100' : 'bg-blue-500'
                                        }`}
                                >
                                    {isGuestBookingLoading ? (
                                        <ActivityIndicator color="#3B82F6" />
                                    ) : (
                                        <Text className="text-white font-bold">Verify & Book</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={closeOtp} className="mt-4">
                                    <Text className="text-gray-400 font-bold">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )}
            </Modal>

            {/* ── Success Modal ── */}
            <SuccessModal
                visible={showSuccess}
                onClose={handleSuccessDismiss}
                title={isReschedule ? 'Rescheduled!' : 'Booking Confirmed!'}
                message={
                    isReschedule
                        ? `Your appointment with ${doctor.name} has been rescheduled to ${selectedDate} at ${selectedTime}.`
                        : `Your appointment with ${doctor.name} has been confirmed for ${selectedDate} at ${selectedTime}. You will receive a notification with your appointment details.`
                }
            />
        </>
    );
};