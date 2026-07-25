import { create } from 'zustand';
import { Appointment, AppointmentStatus } from '@/shared/types';
import { AppointmentService } from '../services/appointment.service';
import { parseAppointmentDateTime } from '@/shared/utils/timeUtils';

interface AppointmentState {
    appointments: Appointment[];
    isLoading: boolean;
    refreshing: boolean;
    error: string | null;
    lastFetchTime: number | null;
    currentUserPhone: string | null;
    currentUserId: string | null;

    // Actions
    fetchAppointments: (params: { phone?: string; userId?: string }, force?: boolean) => Promise<void>;
    refreshAppointments: (params: { phone?: string; userId?: string }) => Promise<void>;
    cancelAppointment: (id: string) => Promise<void>;
    rescheduleAppointment: (id: string, data: Partial<Appointment>) => Promise<{ status: number; data?: Appointment }>;
    addAppointment: (appointment: Appointment) => void;
    updateAppointmentInList: (id: string, updates: Partial<Appointment>) => void;
    getUpcomingAppointments: () => Appointment[];
    setError: (error: string | null) => void;
    clearError: () => void;
}

const CACHE_DURATION_MS = 30_000; // 30 seconds

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
    appointments: [],
    isLoading: false,
    refreshing: false,
    error: null,
    lastFetchTime: null,
    currentUserPhone: null,
    currentUserId: null,

    fetchAppointments: async (params, force = false) => {
        const state = get();
        const userPhone = params.phone || state.currentUserPhone;
        const userId = params.userId || state.currentUserId;

        if (!userPhone && !userId) {
            set({ error: 'No user identifier provided' });
            return;
        }

        // Cache guard — skip if data is fresh and for the same user
        const now = Date.now();
        const timeSinceLastFetch = state.lastFetchTime ? now - state.lastFetchTime : Infinity;
        if (
            !force &&
            state.appointments.length > 0 &&
            timeSinceLastFetch < CACHE_DURATION_MS &&
            state.currentUserPhone === userPhone &&
            state.currentUserId === userId
        ) {
            return;
        }

        set({
            isLoading: true,
            error: null,
            currentUserPhone: userPhone,
            currentUserId: userId,
        });

        try {
            const fetchParams: { phone?: string; userId?: string } = {};
            if (userPhone) fetchParams.phone = userPhone;
            else if (userId) fetchParams.userId = userId;

            const appointments = await AppointmentService.getAppointments(fetchParams);
            set({
                appointments: appointments || [],
                isLoading: false,
                lastFetchTime: Date.now(),
                error: null,
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch appointments', isLoading: false });
        }
    },

    refreshAppointments: async (params) => {
        const state = get();
        const userPhone = params.phone || state.currentUserPhone;
        const userId = params.userId || state.currentUserId;

        if (!userPhone && !userId) return;

        set({ refreshing: true, error: null });

        try {
            const fetchParams: { phone?: string; userId?: string } = {};
            if (userPhone) fetchParams.phone = userPhone;
            else if (userId) fetchParams.userId = userId;

            const appointments = await AppointmentService.getAppointments(fetchParams);
            set({
                appointments: appointments || [],
                refreshing: false,
                lastFetchTime: Date.now(),
                error: null,
            });
        } catch (error: any) {
            set({ refreshing: false, error: error.message || 'Failed to refresh appointments' });
        }
    },

    cancelAppointment: async (id) => {
        const previousAppointments = get().appointments;

        // Optimistic update
        set({
            appointments: previousAppointments.map((apt) =>
                apt.$id === id ? { ...apt, status: 'Cancelled' as AppointmentStatus } : apt
            ),
        });

        try {
            const result = await AppointmentService.updateAppointmentStatus(id, 'Cancelled');
            if (result.status !== 200) {
                // Rollback
                set({ appointments: previousAppointments, error: 'Failed to cancel appointment' });
            }
        } catch (error: any) {
            set({ appointments: previousAppointments, error: error.message });
        }
    },

    rescheduleAppointment: async (id, data) => {
        try {
            const result = await AppointmentService.rescheduleAppointment(id, data);

            if (result.status === 200 && result.data) {
                // Update the appointment in the local list
                set((state) => ({
                    appointments: state.appointments.map((apt) =>
                        apt.$id === id ? { ...apt, ...result.data } : apt
                    ),
                }));
            }

            return result;
        } catch (error: any) {
            return { status: 500 };
        }
    },

    addAppointment: (appointment) => {
        set((state) => ({
            appointments: [appointment, ...state.appointments],
        }));
    },

    updateAppointmentInList: (id, updates) => {
        set((state) => ({
            appointments: state.appointments.map((apt) =>
                apt.$id === id ? { ...apt, ...updates } : apt
            ),
        }));
    },

    getUpcomingAppointments: () => {
        const { appointments } = get();
        const now = new Date();

        return appointments
            .filter((a) => {
                if (a.status === 'Cancelled') return false;
                const dt = parseAppointmentDateTime(a.date, a.time);
                return dt > now;
            })
            .sort((a, b) => {
                const dtA = parseAppointmentDateTime(a.date, a.time);
                const dtB = parseAppointmentDateTime(b.date, b.time);
                return dtA.getTime() - dtB.getTime();
            });
    },

    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
}));
