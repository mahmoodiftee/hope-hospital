import { useState, useCallback, useEffect, useMemo } from 'react';
import { AppointmentService } from '../services/appointment.service';
import { TimeSlot, TimeSlotStatus } from '@/shared/types';
import { MASTER_TIME_SLOTS, APPOINTMENT_BOOKING_BUFFER_MINUTES, APPOINTMENT_BOOKING_DAYS_AHEAD } from '@/shared/constants';
import { timeStringToMinutes, getCurrentTimeInMinutes, getTodayDateString, normalizeTimeFormat } from '@/shared/utils/timeUtils';

type DoctorSchedule = {
    day: string[];
    time: string[];
    timesByDay: Record<string, string[]>;
};

/**
 * useAvailableSlots — fetches a doctor's schedule from the `timeslots` collection
 * and computes which master time slots are available for a given date.
 *
 * Also exposes `availableDays` for the calendar to highlight selectable days.
 */
export const useAvailableSlots = (doctorId: string, selectedDate: string) => {
    const [doctorSchedule, setDoctorSchedule] = useState<DoctorSchedule | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch doctor's schedule once (not per-date — the schedule itself is date-independent)
    const fetchSchedule = useCallback(async () => {
        if (!doctorId) return;

        setIsLoading(true);
        setError(null);
        try {
            const schedule = await AppointmentService.getDoctorTimeSlots(doctorId);
            setDoctorSchedule(schedule);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch schedule');
        } finally {
            setIsLoading(false);
        }
    }, [doctorId]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const selectedDayName = useMemo(() => {
        if (!selectedDate) return null;
        // Noon avoids timezone day-boundary flips when parsing YYYY-MM-DD
        const date = new Date(`${selectedDate}T12:00:00`);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }, [selectedDate]);

    // Compute time slots for the selected date
    const slots: TimeSlot[] = useMemo(() => {
        if (!doctorSchedule || !selectedDate || !selectedDayName) return [];

        const today = getTodayDateString();
        const currentTimePlusBuffer = getCurrentTimeInMinutes() + APPOINTMENT_BOOKING_BUFFER_MINUTES;
        const dayTimes =
            doctorSchedule.timesByDay[selectedDayName] ??
            (doctorSchedule.day.includes(selectedDayName) ? doctorSchedule.time : []);

        return MASTER_TIME_SLOTS.map((time, index) => {
            const normalizedTime = normalizeTimeFormat(time);
            const isInDoctorSchedule = dayTimes.some(
                (t) => normalizeTimeFormat(t) === normalizedTime
            );

            let status: TimeSlotStatus = 'available';
            let available = true;

            if (!isInDoctorSchedule) {
                status = 'not_available';
                available = false;
            } else if (selectedDate === today) {
                const slotMinutes = timeStringToMinutes(time);
                if (slotMinutes <= currentTimePlusBuffer) {
                    status = 'time_passed';
                    available = false;
                }
            }

            return {
                id: `${index + 1}`,
                time,
                available,
                status,
                label:
                    status === 'available'
                        ? 'Available'
                        : status === 'time_passed'
                            ? 'Time Passed'
                            : 'Not Available',
            };
        });
    }, [doctorSchedule, selectedDate, selectedDayName]);

    // Compute available days for the next N days (for the calendar)
    const availableDays: string[] = useMemo(() => {
        if (!doctorSchedule?.day?.length) return [];

        const result: string[] = [];
        const now = new Date();

        for (let i = 0; i < APPOINTMENT_BOOKING_DAYS_AHEAD; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);

            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            if (doctorSchedule.day.includes(dayName)) {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                result.push(`${y}-${m}-${d}`);
            }
        }

        return result;
    }, [doctorSchedule]);

    // Calendar marked-dates object for react-native-calendars
    const markedDates = useMemo(() => {
        const today = getTodayDateString();
        const marks: Record<string, any> = {};

        // Mark all available days with green highlight
        for (const dateStr of availableDays) {
            const isToday = dateStr === today;
            marks[dateStr] = {
                customStyles: {
                    container: {
                        backgroundColor: '#ECFDF5',
                        borderWidth: isToday ? 1 : 0,
                        borderColor: isToday ? '#14532d' : undefined,
                    },
                    text: {
                        color: '#047857',
                        fontWeight: '700' as const,
                    },
                },
            };
        }

        // Override selected date styling
        if (selectedDate) {
            marks[selectedDate] = {
                ...(marks[selectedDate] || {}),
                customStyles: {
                    container: { backgroundColor: '#007AFF' },
                    text: { color: '#ffffff', fontWeight: 'bold' as const },
                },
            };
        }

        return marks;
    }, [availableDays, selectedDate]);

    // Disable days that are not in doctor's schedule
    const isDateAvailable = useCallback(
        (dateString: string) => availableDays.includes(dateString),
        [availableDays]
    );

    return {
        slots,
        isLoading,
        error,
        availableDays,
        markedDates,
        isDateAvailable,
        refetch: fetchSchedule,
    };
};
