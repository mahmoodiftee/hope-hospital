import { useState, useCallback, useEffect } from 'react';
import { AppointmentService } from '../services/appointment.service';
import { AuthService, useAuthStore } from '@/features/auth';
import { Appointment, User, ValidationErrors } from '@/shared/types';
import { toast } from 'sonner-native';
import { useNotificationStore } from '@/features/notifications';
import { sendPushToUser } from '@/shared/services/sendNotification.service';
import { registerPushToken } from '@/shared/services/pushToken.service';
import { OTP_RESEND_COUNTDOWN_SECONDS } from '@/shared/constants';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * useGuestBooking — orchestrates the full guest booking flow:
 * Validate → Send OTP → Verify OTP → Check/Create User → Book → Notify
 */
export const useGuestBooking = (
    doctor: { id: string; name: string; specialty: string; hourlyRate: number }
) => {
    const { setSession } = useAuthStore();
    const { refreshUnreadCount, fetchNotifications } = useNotificationStore();

    const [patientInfo, setPatientInfo] = useState({
        name: '',
        age: '',
        phone: '',
    });

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        name: '', age: '', phone: '', date: '', time: '',
    });

    // Resend countdown state
    const [countdown, setCountdown] = useState(OTP_RESEND_COUNTDOWN_SECONDS);
    const [canResend, setCanResend] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (showOtp && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, showOtp]);

    const validate = useCallback(() => {
        const errors: ValidationErrors = { name: '', age: '', phone: '', date: '', time: '' };
        let hasError = false;

        if (!patientInfo.name.trim()) { errors.name = 'Patient name is required'; hasError = true; }
        if (!patientInfo.age.trim() || isNaN(Number(patientInfo.age)) || Number(patientInfo.age) <= 0) {
            errors.age = 'Valid age is required'; hasError = true;
        }
        if (!patientInfo.phone.trim() || patientInfo.phone.replace(/\D/g, '').length < 10) {
            errors.phone = 'Valid phone is required'; hasError = true;
        }
        if (!selectedDate) { errors.date = 'Date is required'; hasError = true; }
        if (!selectedTime) { errors.time = 'Time is required'; hasError = true; }

        setValidationErrors(errors);
        return !hasError;
    }, [patientInfo, selectedDate, selectedTime]);

    // ── Send OTP ──────────────────────────────────────────────────────────────

    const sendOtp = async (): Promise<boolean> => {
        if (!validate()) return false;

        setIsLoading(true);
        try {
            const resp = await fetch(`${API_BASE_URL}/api/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: patientInfo.phone.trim() }),
            });
            const data = await resp.json();

            if (data.success) {
                toast.success('Verification code sent');
                setShowOtp(true);
                setCountdown(OTP_RESEND_COUNTDOWN_SECONDS);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                return true;
            } else {
                throw new Error(data.message || 'Failed to send OTP');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to send verification code');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // ── Resend OTP ────────────────────────────────────────────────────────────

    const resendOtp = async (): Promise<boolean> => {
        if (!canResend) return false;

        setIsLoading(true);
        try {
            const resp = await fetch(`${API_BASE_URL}/api/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: patientInfo.phone.trim() }),
            });
            const data = await resp.json();

            if (data.success) {
                toast.success('New verification code sent');
                setOtp(['', '', '', '', '', '']);
                setCountdown(OTP_RESEND_COUNTDOWN_SECONDS);
                setCanResend(false);
                return true;
            } else {
                toast.error('Failed to resend code. Please try again.');
                return false;
            }
        } catch (error) {
            toast.error('Network error. Could not resend code.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // ── Verify OTP + Book ─────────────────────────────────────────────────────

    const verifyAndBook = async (): Promise<boolean> => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            toast.error('Enter 6-digit OTP');
            return false;
        }

        setIsLoading(true);
        try {
            // 1. Verify OTP via backend
            const verifyResp = await fetch(`${API_BASE_URL}/api/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: patientInfo.phone.trim(),
                    otp: otpString,
                }),
            });
            const verifyData = await verifyResp.json();

            if (!verifyData.success) {
                toast.error(verifyData.message || 'Invalid or expired OTP');
                if (verifyData.attemptsLeft !== undefined) {
                    toast.error(`${verifyData.attemptsLeft} attempts remaining`);
                }
                return false;
            }

            // 2. Check if user already exists in DB
            const existingUser = await AuthService.checkUserExists(patientInfo.phone.trim());
            let userId: string;
            let dbUser;

            if (existingUser.exists && existingUser.user) {
                // Use existing user
                dbUser = existingUser.user;
                userId = dbUser.$id;
            } else {
                // Create new user
                dbUser = await AuthService.createUser({
                    name: patientInfo.name.trim(),
                    age: Number(patientInfo.age.trim()),
                    phone: patientInfo.phone.trim(),
                });
                userId = dbUser.$id;
            }

            // 3. Set session (also registers push token internally)
            const sessionUser: User = {
                id: userId,
                name: patientInfo.name.trim(),
                age: Number(patientInfo.age.trim()),
                phone: patientInfo.phone.trim(),
                createdAt: new Date().toISOString(),
            };
            await setSession(sessionUser, dbUser);

            // 4. Book appointment with conflict check
            const appointmentData: Appointment = {
                doctorId: doctor.id,
                doctor_name: doctor.name,
                specialty: doctor.specialty,
                amount: doctor.hourlyRate,
                date: selectedDate,
                time: selectedTime,
                userId,
                patient_name: patientInfo.name.trim(),
                patient_age: Number(patientInfo.age.trim()),
                contactNumber: patientInfo.phone.trim(),
            };

            const result = await AppointmentService.bookAppointment(appointmentData);

            if (result.status === 409) {
                toast.error('This time slot is already booked. Please choose another one.');
                return false;
            }

            if (result.status !== 200 || !result.data) {
                toast.error('An unexpected error occurred. Please try again.');
                return false;
            }

            // 5. Confirmation notification (non-blocking)
            await AppointmentService.createNotification({
                userId,
                type: 'appointment_confirmation',
                title: 'Appointment Confirmed',
                message: `Your appointment with ${doctor.name} has been confirmed for ${selectedDate} at ${selectedTime}.`,
                priority: 3,
                appointmentId: result.data.$id,
                metadata: {
                    doctorName: doctor.name,
                    specialty: doctor.specialty,
                    date: selectedDate,
                    time: selectedTime,
                    amount: doctor.hourlyRate,
                },
            });

            // 6. Push notification (non-blocking)
            sendPushToUser({
                userId,
                title: 'Appointment Confirmed!',
                message: `Your appointment with ${doctor.name} has been confirmed for ${selectedDate} at ${selectedTime}.`,
            }).catch(() => { });

            // 7. Refresh notification badge
            refreshUnreadCount(userId).catch(() => { });
            fetchNotifications(userId).catch(() => { });

            toast.success('Appointment booked successfully!');
            setShowOtp(false);
            return true;
        } catch (error: any) {
            toast.error(error.message || 'Verification failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const closeOtp = () => {
        setShowOtp(false);
        setOtp(['', '', '', '', '', '']);
        setCountdown(OTP_RESEND_COUNTDOWN_SECONDS);
        setCanResend(false);
    };

    return {
        patientInfo,
        setPatientInfo,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        otp,
        setOtp,
        validationErrors,
        isLoading,
        sendOtp,
        resendOtp,
        verifyAndBook,
        showOtp,
        setShowOtp,
        closeOtp,
        countdown,
        canResend,
    };
};
