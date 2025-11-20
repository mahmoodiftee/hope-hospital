import {
    createAppointmentConfirmationNotification,
    createAppointmentRescheduleConfirmationNotification,
    deleteNotification,
    getAppointmentNotifications,
    getAppointments,
    getSingleDoctorTimeSlots,
    insertAppointment,
    saveUserToDB,
    updateAppointment
} from '@/lib/appwrite';
import { registerForPushNotificationsAsync, registerPushTokenWithBackend } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/sendNotification';
import useAppwrite from '@/lib/useAppwrite';
import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import * as SecureStore from 'expo-secure-store';
import { X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast, Toaster } from 'sonner-native';
import { Appointment, AppointmentBookingProps, PatientInfo, TimeSlot, ValidationErrors } from '../../types';
import DatePickerSection from './DatePickerSection';
import DoctorInfoCard from './DoctorInfoCard';
import OtpModal from './OtpModal';
import PatientInfoForm from './PatientInfoForm';
import SuccessModal from './SuccessModal';
import TimeSlotPicker from './TimeSlotPicker';

// Types for better type safety
type BookingResult = {
    success: boolean;
    data?: any;
    message?: string;
    requiresOtp?: boolean;
};

type UserType = 'authenticated' | 'guest';

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
    doctor,
    onClose,
    rescheduleDetails,
    reschedule = false
}) => {
    // State management
    const [selectedDate, setSelectedDate] = useState<string>(rescheduleDetails?.date || '');
    const [selectedTime, setSelectedTime] = useState<string>(rescheduleDetails?.time || '');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [tempAppointmentData, setTempAppointmentData] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        name: '',
        age: '',
        phone: '',
        date: '',
        time: ''
    });

    const [patientInfo, setPatientInfo] = useState<PatientInfo>({
        name: rescheduleDetails?.patient_name || '',
        age: rescheduleDetails?.patient_age?.toString() || '',
        phone: rescheduleDetails?.contactNumber || ''
    });

    const { user, fetchAuthenticatedUser, dbUser } = useAuthStore();
    const phone = user?.phone || dbUser?.phone;
    const userIdCommon = user?.id || dbUser?.$id;
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const { data: slots, loading } = useAppwrite({
        fn: getSingleDoctorTimeSlots,
        params: { id: doctor.id },
    });

    const { refetch: refetchAppointments } = useAppwrite({
        fn: getAppointments,
        params: { phone },
        skip: !phone,
    });

    const { fetchUnreadCount, fetchNotifications } = useNotificationStore();

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

    const getUserType = (): UserType => {
        return (user && dbUser) ? 'authenticated' : 'guest';
    };

    const createAppointmentData = (): Appointment => ({
        doctorId: doctor.id,
        doctor_name: doctor.name,
        specialty: doctor.specialty,
        amount: doctor.hourlyRate || 0,
        date: selectedDate,
        time: selectedTime,
        userId: dbUser?.$id || '',
        patient_name: patientInfo.name.trim(),
        patient_age: parseInt(patientInfo.age.trim()),
        contactNumber: patientInfo.phone.trim(),
    });

    const saveUserToSecureStore = async (userData: any): Promise<void> => {
        try {
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user to SecureStore:', error);
            throw new Error('Failed to save user data');
        }
    };

    const isTimeSlotAvailable = (timeString: string, dateString: string): boolean => {
        const normalizedTime = normalizeTimeFormat(timeString);
        const isInDoctorSchedule = slots?.time?.some(availableTime =>
            normalizeTimeFormat(availableTime) === normalizedTime
        ) ?? false;

        if (!isInDoctorSchedule) {
            return false;
        }

        // Get today's date in the same format as dateString (YYYY-MM-DD)
        const today = new Date().toLocaleDateString('en-CA');

        // If it's NOT today (future date), all doctor's available times are valid
        if (dateString !== today) {
            return true; // Future dates are always available if in doctor's schedule
        }

        // ONLY for today, check if the time has already passed
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Parse the time string (e.g., "09:00 AM", "01:30 PM")
        const [time, period] = timeString.split(' ');
        const [hourStr, minuteStr] = time.split(':');
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);

        // Convert to 24-hour format
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        } else if (period === 'AM' && hour === 12) {
            hour = 0;
        }

        // Compare with current time (add 30 minutes buffer for booking)
        const slotTimeInMinutes = hour * 60 + minute;
        const currentTimeInMinutes = currentHour * 60 + currentMinute + 30; // 30 min buffer

        return slotTimeInMinutes > currentTimeInMinutes;
    };

    const normalizeTimeFormat = (timeString: string): string => {
        const [time, period] = timeString.split(' ');
        const [hour, minute] = time.split(':');
        const paddedHour = hour.padStart(2, '0');
        return `${paddedHour}:${minute} ${period}`;
    };

    const getTimeSlotStatus = (timeString: string, dateString: string) => {
        const normalizedTime = normalizeTimeFormat(timeString);
        const isInDoctorSchedule = slots?.time?.some(availableTime =>
            normalizeTimeFormat(availableTime) === normalizedTime
        ) ?? false;

        if (!isInDoctorSchedule) {
            return {
                available: false,
                status: 'not_available',
                label: 'Not Available'
            };
        }

        const today = new Date().toLocaleDateString('en-CA');

        if (dateString !== today) {
            return {
                available: true,
                status: 'available',
                label: 'Available'
            };
        }

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const [time, period] = timeString.split(' ');
        const [hourStr, minuteStr] = time.split(':');
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);

        if (period === 'PM' && hour !== 12) {
            hour += 12;
        } else if (period === 'AM' && hour === 12) {
            hour = 0;
        }

        const slotTimeInMinutes = hour * 60 + minute;
        const currentTimeInMinutes = currentHour * 60 + currentMinute + 30; // 30 min buffer

        const hasTimePassed = slotTimeInMinutes <= currentTimeInMinutes;

        if (hasTimePassed) {
            return {
                available: false,
                status: 'time_passed',
                label: 'Time Passed'
            };
        } else {
            return {
                available: true,
                status: 'available',
                label: 'Available'
            };
        }
    };

    const handleNotifications = async (appointmentData: Appointment, appointmentId: string, userId: string): Promise<void> => {
        try {
            if (reschedule && rescheduleDetails?.$id) {
                const oldNotifications = await getAppointmentNotifications(rescheduleDetails.$id);
                if (oldNotifications.documents) {
                    const deletePromises = oldNotifications.documents
                        .filter(notification => notification.type === 'appointment_reminder' && !notification.isPushed)
                        .map(notification => deleteNotification(notification.$id));

                    await Promise.all(deletePromises);
                }

                await createAppointmentRescheduleConfirmationNotification(
                    appointmentData,
                    appointmentId,
                    userId,
                    rescheduleDetails.date,
                    rescheduleDetails.time
                );
            } else {
                console.log('test iffty', tempAppointmentData, appointmentId, userId);
                console.log('test iffty before fetch unread count & fetch notification', userId);

                await createAppointmentConfirmationNotification(appointmentData, appointmentId, userId);
            }
            console.log('test iffty before fetch unread count & fetch notification', userId);
            await fetchUnreadCount(userId);
            await fetchNotifications(userId);

        } catch (error) {
            console.error("Error handling notifications:", error);
        }
    };

    class OtpService {
        static async sendOtp(phoneNumber: string): Promise<{ success: boolean; message?: string }> {
            try {
                const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber }),
                });

                const data = await response.json();
                return { success: data.success, message: data.message };
            } catch (error) {
                console.error('Error sending OTP:', error);
                return { success: false, message: 'Network error occurred' };
            }
        }

        static async verifyOtp(phoneNumber: string, otp: string): Promise<{ success: boolean; message?: string; attemptsLeft?: number }> {
            try {
                const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber, otp }),
                });

                return await response.json();
            } catch (error) {
                console.error('Error verifying OTP:', error);
                return { success: false, message: 'Network error occurred' };
            }
        }
    }

    class AppointmentService {
        static async processAppointment(appointmentData: Appointment, isReschedule: boolean, rescheduleId?: string): Promise<BookingResult> {
            try {
                const result = isReschedule && rescheduleId
                    ? await updateAppointment(appointmentData, rescheduleId)
                    : await insertAppointment(appointmentData);

                if (result.status === 200 && result.data) {
                    return { success: true, data: result.data };
                } else if (result.status === 409) {
                    return { success: false, message: 'This time slot is already booked. Please choose another one.' };
                } else if (result.status === 404 && isReschedule) {
                    return { success: false, message: 'Original appointment not found. Please try booking a new appointment.' };
                } else {
                    return { success: false, message: 'An unexpected error occurred. Please try again.' };
                }
            } catch (error) {
                console.error('Error processing appointment:', error);
                return { success: false, message: 'Network error occurred' };
            }
        }

        static async createUserAndAppointment(patientData: PatientInfo, appointmentData: Appointment): Promise<BookingResult> {
            try {
                const cleanedUser = {
                    name: patientData.name.trim(),
                    age: parseInt(patientData.age.trim(), 10),
                    phone: patientData.phone.trim(),
                };

                const savedUser = await saveUserToDB(cleanedUser);

                await saveUserToSecureStore({
                    id: savedUser.$id,
                    ...cleanedUser,
                    createdAt: new Date().toISOString(),
                });

                const result = await insertAppointment({ ...appointmentData, userId: savedUser.$id });

                if (result.status === 200 && result.data) {
                    return { success: true, data: { appointment: result.data, user: savedUser } };
                } else if (result.status === 409) {
                    return { success: false, message: 'This time slot is already booked. Please choose another one.' };
                } else {
                    return { success: false, message: 'An unexpected error occurred while booking. Please try again.' };
                }
            } catch (error) {
                console.error('Error creating user and appointment:', error);
                return { success: false, message: 'Failed to create user account' };
            }
        }
    }

    const handleBookAppointment = async (): Promise<void> => {
        if (!validateForm()) return;

        setIsLoading(true);
        const appointmentData = createAppointmentData();
        const userType = getUserType();

        try {
            if (userType === 'authenticated') {
                await handleAuthenticatedUserBooking(appointmentData);
            } else {
                await handleGuestUserBooking(appointmentData);
            }
        } catch (error) {
            console.error('Error in booking process:', error);
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthenticatedUserBooking = async (appointmentData: Appointment): Promise<void> => {
        const result = await AppointmentService.processAppointment(appointmentData, reschedule, rescheduleDetails?.$id);

        if (result.success) {
            refetchAppointments();
            try {
                await sendPushToUser({
                    userId: userIdCommon,
                    title: reschedule ? 'Appointment Rescheduled!' : 'Appointment Confirmed!',
                    message: reschedule
                        ? `Your appointment with ${appointmentData.doctor_name} has been rescheduled to ${appointmentData.date} at ${appointmentData.time}.`
                        : `Your appointment with ${appointmentData.doctor_name} has been confirmed for ${appointmentData.date} at ${appointmentData.time}.`,
                });
            } catch (error) {
                console.warn('Push notification failed, but appointment was booked successfully:', error);
                // Don't fail the entire booking process for push notification errors
            }
            await handleNotifications(appointmentData, result.data.$id, userIdCommon);
            showSuccessMessage();
        } else {
            toast.error(result.message || 'Booking failed');
        }
    };

    const handleGuestUserBooking = async (appointmentData: Appointment): Promise<void> => {
        const otpResult = await OtpService.sendOtp(patientInfo.phone.trim());

        if (otpResult.success) {
            setTempAppointmentData(appointmentData);
            openOtpModal();
            toast.success('OTP sent successfully!');
        } else {
            toast.error(otpResult.message || 'Failed to send OTP');
        }
    };

    const handleOtpVerification = async (): Promise<void> => {
        const otpString = otp.join('');
        if (!otpString || otpString.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP');
            return;
        }

        setOtpLoading(true);
        setOtpError('');

        try {
            const verificationResult = await OtpService.verifyOtp(patientInfo.phone.trim(), otpString);

            if (verificationResult.success) {
                await processOtpVerifiedBooking();
            } else {
                handleOtpVerificationError(verificationResult);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setOtpError('Network error. Please check your connection and try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const processOtpVerifiedBooking = async (): Promise<void> => {
        if (!tempAppointmentData || !tempAppointmentData.doctorId || !tempAppointmentData.date || !tempAppointmentData.time) {
            toast.error('Invalid appointment data');
            return;
        }

        try {
            let result: BookingResult;
            let userId: string;

            if (dbUser) {
                // User exists in database, just create appointment
                await saveUserToSecureStore({
                    id: dbUser.$id,
                    name: dbUser.name,
                    age: dbUser.age,
                    phone: dbUser.phone,
                    createdAt: new Date().toISOString(),
                });

                result = await AppointmentService.processAppointment(tempAppointmentData, reschedule, rescheduleDetails?.$id);
                userId = dbUser.$id;
            } else {
                // Create new user and appointment
                result = await AppointmentService.createUserAndAppointment(
                    patientInfo,
                    tempAppointmentData,
                );
                userId = result.data?.user?.$id || userIdCommon;
                if (!userId) {
                    console.warn("No user ID found. Push token registration skipped.");
                    return;
                }

                try {
                    const expoPushToken = await registerForPushNotificationsAsync();

                    if (expoPushToken) {
                        await registerPushTokenWithBackend(userId, expoPushToken);
                        console.log('Push token registered for new user:', userId);
                    } else {
                        console.warn("No Expo push token received.");
                    }
                } catch (error) {
                    console.warn("Failed to register push token:", error);
                }
            }

            if (result.success) {
                const appointmentId = result.data?.appointment?.$id || result.data?.$id;
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    await sendPushToUser({
                        userId,
                        title: reschedule ? 'Appointment Rescheduled!' : 'Appointment Confirmed!',
                        message: reschedule
                            ? `Your appointment with ${tempAppointmentData.doctor_name} has been rescheduled to ${tempAppointmentData.date} at ${tempAppointmentData.time}.`
                            : `Your appointment with ${tempAppointmentData.doctor_name} has been confirmed for ${tempAppointmentData.date} at ${tempAppointmentData.time}.`,
                    });
                } catch (error) {
                    console.warn('Push notification failed, but appointment was booked successfully:', error);
                }
                // console.log('test iffty', tempAppointmentData, appointmentId, userId);
                await handleNotifications(tempAppointmentData, appointmentId, userId);
                refetchAppointments();
                setShowOtpModal(false);
                showSuccessMessage();
                fetchAuthenticatedUser();
            } else {
                setShowOtpModal(false);
                toast.error(result.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Error processing OTP verified booking:', error);
            setShowOtpModal(false);
            toast.error('An unexpected error occurred while booking. Please try again.');
        }
    };

    const handleOtpVerificationError = (result: { message?: string; attemptsLeft?: number }): void => {
        setOtpError(result.message || 'Invalid or expired OTP');
        if (result.attemptsLeft !== undefined) {
            toast.error(`${result.attemptsLeft} attempts remaining`);
        }
    };

    const showSuccessMessage = (): void => {
        const message = reschedule ? 'Appointment rescheduled successfully!' : 'Appointment booked successfully!';
        setShowSuccessModal(true);
        toast.success(message);
    };

    const openOtpModal = (): void => {
        setShowOtpModal(true);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setCountdown(60);
        setCanResend(false);
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);
    };

    useEffect(() => {
        if (showOtpModal && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, showOtpModal]);

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {
            name: '',
            age: '',
            phone: '',
            date: '',
            time: ''
        };

        if (!patientInfo.name.trim()) {
            errors.name = 'Patient name is required';
        }

        if (!patientInfo.age.trim()) {
            errors.age = 'Patient age is required';
        } else if (isNaN(Number(patientInfo.age)) || Number(patientInfo.age) <= 0) {
            errors.age = 'Please enter a valid age';
        }

        if (!patientInfo.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else {
            const cleanPhone = patientInfo.phone.replace(/\D/g, '');
            if (cleanPhone.length < 10 || cleanPhone.length > 15) {
                errors.phone = 'Please enter a valid phone number (10-15 digits)';
            }
        }

        if (!selectedDate) {
            errors.date = 'Please select an appointment date';
        }

        if (!selectedTime) {
            errors.time = 'Please select an appointment time';
        } else if (selectedDate && !isTimeSlotAvailable(selectedTime, selectedDate)) {
            const today = new Date().toLocaleDateString('en-CA');
            if (selectedDate === today) {
                errors.time = 'This time slot has passed. Please select a future time.';
            } else {
                errors.time = 'This time slot is no longer available. Please select another time.';
            }
        }

        setValidationErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    const isFormValid = (): boolean => {
        return !!(selectedDate &&
            selectedTime &&
            patientInfo.name.trim() &&
            patientInfo.age.trim() &&
            patientInfo.phone.trim() &&
            isTimeSlotAvailable(selectedTime, selectedDate));
    };

    const handleDateSelect = (day: any): void => {
        setSelectedDate(day.dateString);
        setSelectedTime('');
        setValidationErrors(prev => ({
            ...prev,
            date: '',
            time: ''
        }));
    };

    const handleTimeSelect = (time: string): void => {
        const status = getTimeSlotStatus(time, selectedDate);

        if (status.available) {
            setSelectedTime(time);
            setValidationErrors(prev => ({
                ...prev,
                time: ''
            }));
        } else {
            if (status.status === 'time_passed') {
                toast.error('This time slot has passed. Please select a future time.');
            } else if (status.status === 'not_available') {
                toast.error('This time slot is not available. Please select another time.');
            }
        }
    };


    const handlePatientInfoChange = (field: keyof PatientInfo, value: string): void => {
        setPatientInfo(prev => ({
            ...prev,
            [field]: value
        }));
        if (value.trim()) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSuccessModalClose = (): void => {
        setShowSuccessModal(false);
        onClose();
    };

    const handleOtpChange = (text: string, index: number): void => {
        // Handle multi-digit input (auto-fill or paste)
        if (text.length > 1) {
            const otpArray = text.replace(/[^0-9]/g, '').split('').slice(0, 6);
            const newOtp = [...otp];

            // Fill the OTP array with the digits
            otpArray.forEach((digit, i) => {
                if (i < 6) {
                    newOtp[i] = digit;
                }
            });

            // Clear remaining fields if the input is shorter than 6 digits
            for (let i = otpArray.length; i < 6; i++) {
                newOtp[i] = '';
            }

            setOtp(newOtp);

            // Focus the next empty field or the last field if all are filled
            const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;

            setTimeout(() => {
                inputRefs.current[focusIndex]?.focus();
            }, 100);

            // Clear any existing error
            if (otpError) setOtpError('');
            return;
        }

        // Handle single digit input
        const digit = text.replace(/[^0-9]/g, '');
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Auto-focus next input for single digit entry
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Clear any existing error
        if (otpError) setOtpError('');
    };

    const handleKeyPress = (e: any, index: number): void => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handleResendOtp = async (): Promise<void> => {
        if (!canResend) return;

        setResendLoading(true);

        try {
            const result = await OtpService.sendOtp(patientInfo.phone.trim());

            if (result.success) {
                toast.success('New OTP sent successfully!');
                setOtp(['', '', '', '', '', '']);
                setCountdown(60);
                setCanResend(false);
                setOtpError('');
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);
            } else {
                toast.error('Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            toast.error('Network error. Could not resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCloseOtpModal = (): void => {
        setShowOtpModal(false);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setTempAppointmentData(null);
        setCountdown(60);
        setCanResend(false);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center bg-white">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    const today = new Date().toLocaleDateString('en-CA');

    const masterTimeSlots = [
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '01:00 PM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM',
        '05:00 PM',
        '06:00 PM',
        '07:00 PM',
        '08:00 PM',
    ];

    const timeSlots: TimeSlot[] = masterTimeSlots.map((time, index) => {
        const status = getTimeSlotStatus(time, selectedDate);
        return {
            id: `${index + 1}`,
            time,
            available: status.available,
            status: status.status,
            label: status.label
        };
    });

    const getMarkedAvailableDays = () => {
        const result: Record<string, any> = {};
        const now = new Date();

        for (let i = 0; i < 30; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);

            const formatted = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', {
                weekday: 'long',
                timeZone: 'UTC',
            });

            const isAvailable = slots?.day?.includes(dayName);
            const isToday = formatted === today;

            result[formatted] = {
                disabled: !isAvailable && !isToday,
                disableTouchEvent: !isAvailable && !isToday,
                customStyles: isAvailable
                    ? {
                        container: {
                            backgroundColor: '#ECFDF5',
                            borderWidth: isToday ? 1 : 0,
                            borderColor: isToday && '#14532d',
                        },
                        text: {
                            color: '#047857',
                            fontWeight: '700',
                        },
                    }
                    : undefined,
            };
        }

        return result;
    };

    const markedDates = {
        ...getMarkedAvailableDays(),
        ...(selectedDate && {
            [selectedDate]: {
                ...getMarkedAvailableDays()[selectedDate],
                customStyles: {
                    container: {
                        backgroundColor: '#007AFF',
                    },
                    text: {
                        color: '#ffffff',
                        fontWeight: 'bold',
                    },
                },
            },
        }),
    };

    const isOtpComplete = otp.every(digit => digit !== '');
    const headerTitle = reschedule ? 'Reschedule Appointment' : 'Book Appointment';
    const buttonText = reschedule ? 'Reschedule Appointment' : 'Confirm Appointment';


    return (
        <>
            <SafeAreaView className="flex-1 bg-white">
                <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                    <View className="flex-row justify-between items-center px-6 py-4">
                        <Text className="text-2xl font-semibold text-center text-dark-100">{headerTitle}</Text>
                        <TouchableOpacity
                            className="rounded-full bg-gray-50 justify-center items-center p-1"
                            onPress={onClose}
                        >
                            <X color="rgba(0,0,0,1)" size={24} />
                        </TouchableOpacity>
                    </View>

                    {reschedule && (
                        <View className="mx-6 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <Text className="text-sm font-medium text-yellow-800 mb-2">Current Appointment</Text>
                            <Text className="text-sm text-yellow-700">
                                {rescheduleDetails?.date} at {rescheduleDetails?.time}
                            </Text>
                            <Text className="text-xs text-yellow-600 mt-1">
                                Select new date and time below to reschedule
                            </Text>
                        </View>
                    )}

                    <DoctorInfoCard doctor={doctor} />

                    <PatientInfoForm
                        patientInfo={patientInfo}
                        validationErrors={validationErrors}
                        onPatientInfoChange={handlePatientInfoChange}
                        disabled={reschedule ? true : false}
                    />

                    <DatePickerSection
                        selectedDate={selectedDate}
                        validationErrors={validationErrors}
                        markedDates={markedDates}
                        today={today}
                        onDateSelect={handleDateSelect}
                    />

                    {selectedDate && (
                        <TimeSlotPicker
                            selectedTime={selectedTime}
                            validationErrors={validationErrors}
                            timeSlots={timeSlots}
                            onTimeSelect={handleTimeSelect}
                        />
                    )}

                    <TouchableOpacity
                        className={`mx-6 py-4 rounded-xl items-center mt-6 ${!isFormValid() ? 'bg-blue' : 'bg-blue'
                            }`}
                        style={{
                            shadowColor: !isFormValid() ? 'transparent' : '#6366f1',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: !isFormValid() ? 0 : 0.3,
                            shadowRadius: 8,
                            elevation: !isFormValid() ? 0 : 6,
                        }}
                        onPress={handleBookAppointment}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <View className="flex-row items-center">
                                <ActivityIndicator color="#ffffff" size="small" />
                                <Text className="text-white text-lg font-semibold ml-2">
                                    {reschedule ? 'Rescheduling...' : 'Booking...'}
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-white text-lg font-semibold">
                                {!patientInfo.name || !patientInfo.age || !patientInfo.phone
                                    ? 'Fill Patient Details'
                                    : !selectedDate
                                        ? 'Select Date & Time'
                                        : !selectedTime
                                            ? 'Select Time Slot'
                                            : buttonText
                                }
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>

                {/* Success Modal */}
                <SuccessModal
                    visible={showSuccessModal}
                    onClose={handleSuccessModalClose}
                />

                <OtpModal
                    visible={showOtpModal}
                    otp={otp}
                    otpError={otpError}
                    otpLoading={otpLoading}
                    resendLoading={resendLoading}
                    countdown={countdown}
                    canResend={canResend}
                    isOtpComplete={isOtpComplete}
                    phone={patientInfo.phone}
                    //@ts-ignore
                    inputRefs={inputRefs}
                    onOtpChange={handleOtpChange}
                    onKeyPress={handleKeyPress}
                    onResendOtp={handleResendOtp}
                    onOtpVerification={handleOtpVerification}
                    onClose={handleCloseOtpModal}
                />
            </SafeAreaView>
            <Toaster
                position="top-center"
                duration={3000}
                swipeToDismissDirection="up"
                richColors={true}
                closeButton={true}
            />
        </>
    );
};

export default AppointmentBooking;