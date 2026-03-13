import { Appointment } from '@/types';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { useCallback } from 'react';
import { useAppointmentUtils } from './useAppointmentUtils';

type IconComponent = typeof AlertCircle;

type AppointmentStatus = {
    IconComponent: IconComponent;
    iconProps: { size: number; color: string };
    text: string;
    color: string;
};

export const useAppointmentStatus = () => {
    const { getAppointmentDate } = useAppointmentUtils();

    const getTimeUntilAppointment = useCallback(
        (date: string, time: string, status: string) => {
            try {
                if (status === 'Cancelled') {
                    return { text: 'Cancelled', urgent: false, color: '#dc2626' };
                }

                const appointmentDate = getAppointmentDate(date, time);
                if (isNaN(appointmentDate.getTime())) {
                    return { text: 'Invalid date', urgent: false, color: '#4b5563' };
                }

                const now = new Date();
                const diffInMs = appointmentDate.getTime() - now.getTime();
                const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));

                if (diffInMs < 0) return { text: 'Completed', urgent: false, color: '#10b981' };
                if (diffInHours <= 2) return { text: 'Starting soon', urgent: true, color: '#dc2626' };
                if (diffInHours <= 24) return { text: `In ${diffInHours}h`, urgent: false, color: '#ea580c' };

                const diffInDays = Math.floor(diffInHours / 24);
                return { text: `In ${diffInDays}d`, urgent: false, color: '#3b82f6' };
            } catch {
                return { text: 'Invalid date', urgent: false, color: '#4b5563' };
            }
        },
        [getAppointmentDate]
    );

    const getAppointmentStatus = useCallback(
        (appointment: Appointment): AppointmentStatus => {
            const { status, date, time } = appointment;
            const timeInfo = getTimeUntilAppointment(date, time, status || '');

            if (status === 'Cancelled') {
                return {
                    IconComponent: XCircle,
                    iconProps: { size: 16, color: '#dc2626' },
                    text: 'Cancelled',
                    color: '#dc2626',
                };
            }

            if (timeInfo.urgent) {
                return {
                    IconComponent: AlertCircle,
                    iconProps: { size: 16, color: timeInfo.color },
                    text: timeInfo.text,
                    color: timeInfo.color,
                };
            }

            const appointmentDate = getAppointmentDate(date, time);
            const isUpcoming = appointmentDate > new Date();

            if (isUpcoming) {
                return {
                    IconComponent: Clock,
                    iconProps: { size: 16, color: timeInfo.color },
                    text: timeInfo.text,
                    color: timeInfo.color,
                };
            }

            // Default fallback: completed or unknown
            return {
                IconComponent: CheckCircle,
                iconProps: { size: 16, color: timeInfo.color },
                text: timeInfo.text,
                color: timeInfo.color,
            };
        },
        [getTimeUntilAppointment, getAppointmentDate]
    );

    return { getAppointmentStatus };
};