import { useState, useCallback } from 'react';
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
    doctor: { id: string; name: string; specialty: string; hourlyRate: number },
    rescheduleDetails?: Appointment
) => {
    const { dbUser, user, isAuthenticated } = useAuth();
    const { addAppointment, rescheduleAppointment: storeReschedule } = useAppointmentStore();
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

    const book = async (): Promise<Appointment | null> => {
        if (!validate()) return null;

        setIsLoading(true);
        try {
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
                        title: 'Appointment Rescheduled',
                        message: `Your appointment with ${doctor.name} has been rescheduled from ${rescheduleDetails.date} ${rescheduleDetails.time} to ${selectedDate} at ${selectedTime}.`,
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
