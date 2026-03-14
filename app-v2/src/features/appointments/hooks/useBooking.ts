import { useState, useCallback, useEffect } from 'react';
import i18n from 'i18next';
import { AppointmentService } from '../services/appointment.service';
import { Appointment, ValidationErrors } from '@/shared/types';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner-native';
import { useAppointmentStore } from '../stores/appointment.store';
import { useNotificationStore } from '@/features/notifications';
import { sendPushToUser } from '@/shared/services/sendNotification.service';

/**
 * useBooking — orchestrates the authenticated-user booking and reschedule flows.
 *
 * When `rescheduleDetails` is provided, the hook runs in reschedule mode:
 * - Patient info is pre-filled and disabled in the UI
 * - `book()` calls `rescheduleAppointment` instead of `bookAppointment`
 * - Notifications are typed as 'appointment_reschedule'
 */
export const useBooking = (
    doctor: { id: string; name: string; name_bn?: string; specialty: string; specialty_bn?: string; hourlyRate: number },
    rescheduleDetails?: Appointment
) => {
    const { dbUser, user, isAuthenticated } = useAuth();
    const { addAppointment, rescheduleAppointment: storeReschedule, appointments } = useAppointmentStore();
    const { refreshUnreadCount, fetchNotifications } = useNotificationStore();

    const isReschedule = !!rescheduleDetails;
    const userId = user?.id || dbUser?.$id || '';

    const [patientInfo, setPatientInfo] = useState({
        name: rescheduleDetails?.patient_name || dbUser?.name || '',
        age: rescheduleDetails?.patient_age?.toString() || dbUser?.age?.toString() || '',
        phone: rescheduleDetails?.contactNumber || user?.phone || dbUser?.phone || '',
    });

    const [selectedDate, setSelectedDate] = useState(rescheduleDetails?.date || '');
    const [selectedTime, setSelectedTime] = useState(rescheduleDetails?.time || '');
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        name: '', age: '', phone: '', date: '', time: '',
    });

    // Synchronize state when rescheduleDetails changes
    useEffect(() => {
        if (rescheduleDetails) {
            setPatientInfo({
                name: rescheduleDetails.patient_name || dbUser?.name || '',
                age: rescheduleDetails.patient_age?.toString() || dbUser?.age?.toString() || '',
                phone: rescheduleDetails.contactNumber || user?.phone || dbUser?.phone || '',
            });
            setSelectedDate(rescheduleDetails.date || '');
            setSelectedTime(rescheduleDetails.time || '');
        } else if (!isReschedule) {
            // Reset to defaults if we switch back to normal booking mode
            setPatientInfo({
                name: dbUser?.name || '',
                age: dbUser?.age?.toString() || '',
                phone: user?.phone || dbUser?.phone || '',
            });
            setSelectedDate('');
            setSelectedTime('');
        }
    }, [rescheduleDetails, dbUser, user, isReschedule]);

    const validate = useCallback(() => {
        const errors: ValidationErrors = { name: '', age: '', phone: '', date: '', time: '' };
        let hasError = false;

        if (!patientInfo.name.trim()) { errors.name = i18n.t('appointments.booking.validation.name'); hasError = true; }
        if (!patientInfo.age.trim() || isNaN(Number(patientInfo.age)) || Number(patientInfo.age) <= 0) {
            errors.age = i18n.t('appointments.booking.validation.age'); hasError = true;
        }
        if (!patientInfo.phone.trim() || patientInfo.phone.replace(/\D/g, '').length < 10) {
            errors.phone = i18n.t('appointments.booking.validation.phone'); hasError = true;
        }
        if (!selectedDate) { errors.date = i18n.t('appointments.booking.validation.date'); hasError = true; }
        if (!selectedTime) { errors.time = i18n.t('appointments.booking.validation.time'); hasError = true; }

        setValidationErrors(errors);
        return !hasError;
    }, [patientInfo, selectedDate, selectedTime]);

    const book = async (): Promise<Appointment | null> => {
        if (!validate()) return null;

        // Check if user already has an appointment on the same day (excluding reschedules where they are changing the same appointment)
        const dayConflict = appointments.find(a =>
            a.status !== 'Cancelled' &&
            a.date === selectedDate &&
            (!isReschedule || a.$id !== rescheduleDetails?.$id)
        );

        if (dayConflict) {
            toast.error(i18n.t('appointments.booking.alreadyHasAppointment'));
            return null;
        }

        setIsLoading(true);
        try {
            const appointmentData: Appointment = {
                doctorId: doctor.id,
                doctor_name: doctor.name,
                doctor_name_bn: doctor.name_bn || doctor.name,
                specialty: doctor.specialty,
                specialty_bn: doctor.specialty_bn || doctor.specialty,
                amount: doctor.hourlyRate,
                date: selectedDate,
                time: selectedTime,
                userId,
                patient_name: patientInfo.name.trim(),
                patient_age: Number(patientInfo.age.trim()),
                contactNumber: patientInfo.phone.trim(),
                status: 'Upcoming'
            };

            let result: { status: number; data?: Appointment };

            if (isReschedule && rescheduleDetails?.$id) {
                // ── Reschedule flow ──
                result = await storeReschedule(rescheduleDetails.$id, appointmentData);

                if (result.status === 200 && result.data) {
                    // Delete old reminder notifications, then create reschedule notification
                    try {
                        const oldNotifs = await AppointmentService.getAppointmentNotifications(rescheduleDetails.$id);
                        const deletePromises = oldNotifs
                            .filter((n: any) => n.type === 'appointment_reminder' && !n.isPushed)
                            .map((n: any) => AppointmentService.deleteNotification(n.$id));
                        await Promise.all(deletePromises);
                    } catch { /* non-blocking */ }

                    await AppointmentService.createNotification({
                        userId,
                        type: 'appointment_reschedule',
                        title: i18n.t('appointments.details.notification.rescheduledTitle', { lng: 'en' }),
                        title_bn: i18n.t('appointments.details.notification.rescheduledTitle', { lng: 'bn' }),
                        message: i18n.t('appointments.success.rescheduleMessage', { lng: 'en', doctorName: doctor.name, date: selectedDate, time: selectedTime }),
                        message_bn: i18n.t('appointments.success.rescheduleMessage', {
                            lng: 'bn',
                            doctorName: doctor.name_bn || doctor.name,
                            date: selectedDate,
                            time: selectedTime
                        }),
                        priority: 3,
                        appointmentId: rescheduleDetails.$id,
                        metadata: {
                            doctorName: doctor.name,
                            specialty: doctor.specialty,
                            newDate: selectedDate,
                            newTime: selectedTime,
                            oldDate: rescheduleDetails.date,
                            oldTime: rescheduleDetails.time,
                        },
                    });

                    // Push notification (non-blocking)
                    sendPushToUser({
                        userId,
                        title: 'Appointment Rescheduled!',
                        message: `Your appointment with ${doctor.name} has been rescheduled to ${selectedDate} at ${selectedTime}.`,
                    }).catch(() => { });

                    toast.success('Appointment rescheduled successfully!');
                } else if (result.status === 409) {
                    toast.error('This time slot is already booked. Please choose another one.');
                    return null;
                } else if (result.status === 404) {
                    toast.error('Original appointment not found.');
                    return null;
                } else {
                    toast.error('An unexpected error occurred. Please try again.');
                    return null;
                }
            } else {
                // ── New booking flow ──
                result = await AppointmentService.bookAppointment(appointmentData);

                if (result.status === 200 && result.data) {
                    addAppointment(result.data);

                    // Confirmation notification (non-blocking)
                    await AppointmentService.createNotification({
                        userId,
                        type: 'appointment_confirmation',
                        title: i18n.t('appointments.success.bookingConfirmed', { lng: 'en' }),
                        title_bn: i18n.t('appointments.success.bookingConfirmed', { lng: 'bn' }),
                        message: i18n.t('appointments.success.bookingMessage', { lng: 'en', doctorName: doctor.name, date: selectedDate, time: selectedTime }),
                        message_bn: i18n.t('appointments.success.bookingMessage', {
                            lng: 'bn',
                            doctorName: doctor.name_bn || doctor.name,
                            date: selectedDate,
                            time: selectedTime
                        }),
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

                    // Push notification (non-blocking)
                    sendPushToUser({
                        userId,
                        title: 'Appointment Confirmed!',
                        message: `Your appointment with ${doctor.name} has been confirmed for ${selectedDate} at ${selectedTime}.`,
                    }).catch(() => { });

                    toast.success('Appointment booked successfully!');
                } else if (result.status === 409) {
                    toast.error('This time slot is already booked. Please choose another one.');
                    return null;
                } else {
                    toast.error('An unexpected error occurred. Please try again.');
                    return null;
                }
            }

            // Refresh notification badge
            if (userId) {
                refreshUnreadCount(userId).catch(() => { });
                fetchNotifications(userId).catch(() => { });
            }

            return result.data || null;
        } catch (error: any) {
            toast.error(error.message || 'Failed to book appointment');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        patientInfo,
        setPatientInfo,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        validationErrors,
        isLoading,
        book,
        isAuthenticated,
        isReschedule,
    };
};
