import { getAppointments } from '@/lib/appwrite';
import { Appointment } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppointmentState {
    appointments: Appointment[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    lastFetchTime: number | null;
    currentUserPhone: string | null;
    currentUserId: string | null;

    setAppointments: (appointments: Appointment[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    fetchAppointments: (phone?: string, userId?: string, force?: boolean) => Promise<void>;
    refreshAppointments: (phone?: string, userId?: string) => Promise<void>;

    getUpcomingAppointments: () => Appointment[];
}

const useAppointmentStore = create<AppointmentState>()(
    devtools(
        persist(
            (set, get) => ({
                appointments: [],
                loading: false,
                refreshing: false,
                error: null,
                lastFetchTime: null,
                currentUserPhone: null,
                currentUserId: null,

                setAppointments: (appointments) =>
                    set({ appointments, error: null }, false, 'setAppointments'),

                setLoading: (loading) => set({ loading }, false, 'setLoading'),

                setError: (error) => set({ error }, false, 'setError'),

                fetchAppointments: async (phone, userId, force = false) => {
                    const state = get();
                    const userPhone = phone || state.currentUserPhone;
                    const userIdToUse = userId || state.currentUserId;

                    if (!userPhone && !userIdToUse) {
                        console.warn('No phone number or user ID provided for fetching appointments');
                        set({ error: 'No user identifier provided' }, false, 'fetchAppointments:noIdentifier');
                        return;
                    }

                    const now = Date.now();
                    const timeSinceLastFetch = state.lastFetchTime ? now - state.lastFetchTime : Infinity;
                    const shouldSkipFetch =
                        !force &&
                        state.appointments.length > 0 &&
                        timeSinceLastFetch < 30000 &&
                        state.currentUserPhone === userPhone &&
                        state.currentUserId === userIdToUse;

                    if (shouldSkipFetch) {
                        console.log('Skipping fetch - using cached appointments');
                        return;
                    }

                    try {
                        set({
                            loading: true,
                            error: null,
                            currentUserPhone: userPhone,
                            currentUserId: userIdToUse
                        }, false, 'fetchAppointments:start');

                        let params: { phone: string } | { userId: string };
                        if (userPhone) {
                            params = { phone: userPhone };
                        } else {
                            params = { userId: userIdToUse! };
                        }

                        const result = await getAppointments(params);

                        // console.log('Fetched appointments:', result?.length || 0);

                        set({
                            appointments: result || [],
                            loading: false,
                            lastFetchTime: now,
                            error: null
                        }, false, 'fetchAppointments:success');

                    } catch (error: any) {
                        console.error('Error fetching appointments:', error);
                        set({
                            loading: false,
                            error: error.message || 'Failed to fetch appointments'
                        }, false, 'fetchAppointments:error');
                        throw error;
                    }
                },

                refreshAppointments: async (phone, userId) => {
                    const state = get();
                    const userPhone = phone || state.currentUserPhone;
                    const userIdToUse = userId || state.currentUserId;

                    if (!userPhone && !userIdToUse) {
                        console.warn('No phone number or user ID provided for refreshing appointments');
                        return;
                    }

                    try {
                        set({ refreshing: true, error: null }, false, 'refreshAppointments:start');

                        let params: { phone: string } | { userId: string };
                        if (userPhone) {
                            params = { phone: userPhone };
                        } else {
                            params = { userId: userIdToUse! };
                        }

                        const result = await getAppointments(params);

                        // console.log('Refreshed appointments:', result?.length || 0);

                        set({
                            appointments: result || [],
                            refreshing: false,
                            lastFetchTime: Date.now(),
                            error: null
                        }, false, 'refreshAppointments:success');

                    } catch (error: any) {
                        console.error('Error refreshing appointments:', error);
                        set({
                            refreshing: false,
                            error: error.message || 'Failed to refresh appointments'
                        }, false, 'refreshAppointments:error');
                        throw error;
                    }
                },

                getUpcomingAppointments: () => {
                    const { appointments } = get();
                    const now = new Date();

                    return appointments
                        .filter(a => {
                            if (a.status !== 'Upcoming') {
                                return false;
                            }

                            const [datePart] = a.date.split('T');
                            const timeStr = a.time;

                            let hour, minute;
                            const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

                            if (timeMatch) {
                                hour = parseInt(timeMatch[1]);
                                minute = parseInt(timeMatch[2]);
                                const period = timeMatch[3].toLowerCase();
                                if (period === 'pm' && hour !== 12) {
                                    hour += 12;
                                } else if (period === 'am' && hour === 12) {
                                    hour = 0;
                                }
                            } else {
                                console.warn('Unable to parse time:', timeStr);
                                return false;
                            }

                            const appointmentDateTime = new Date(datePart);
                            appointmentDateTime.setHours(hour, minute, 0, 0);

                            return appointmentDateTime > now;
                        })
                        .sort((a, b) => {
                            const getDateTime = (appointment: Appointment) => {
                                const [datePart] = appointment.date.split('T');
                                const timeStr = appointment.time;
                                const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

                                if (timeMatch) {
                                    let hour = parseInt(timeMatch[1]);
                                    const minute = parseInt(timeMatch[2]);
                                    const period = timeMatch[3].toLowerCase();

                                    if (period === 'pm' && hour !== 12) {
                                        hour += 12;
                                    } else if (period === 'am' && hour === 12) {
                                        hour = 0;
                                    }

                                    const dateTime = new Date(datePart);
                                    dateTime.setHours(hour, minute, 0, 0);
                                    return dateTime;
                                }

                                return new Date(0);
                            };

                            const dateTimeA = getDateTime(a);
                            const dateTimeB = getDateTime(b);
                            return dateTimeA.getTime() - dateTimeB.getTime();
                        });
                },
            }),
            {
                name: 'appointment-store',
            }
        )
    )
);

export default useAppointmentStore;
