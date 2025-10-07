import useAppointmentStore from '@/store/appointment.store';
import useAuthStore from '@/store/auth.store';
import useNotificationStore from '@/store/notification.store';
import { useEffect } from 'react';

export const useUserAppointments = () => {
    const { user, fetchAuthenticatedUser } = useAuthStore();
    const appointmentStore = useAppointmentStore();
    const { fetchUnreadCount, fetchNotifications } = useNotificationStore();

    useEffect(() => {
        if (!user) {
            fetchAuthenticatedUser();
        }
    }, [user, fetchAuthenticatedUser]);

    useEffect(() => {
        if (user?.phone) {
            appointmentStore.fetchAppointments(user.phone, user.id);
        }
    }, [user?.phone, user?.id, appointmentStore.fetchAppointments]);

    const refresh = async () => {
        if (!user?.phone || !user?.id) {
            console.warn('No user data available for refresh');
            return;
        }

        try {
            await appointmentStore.refreshAppointments(user.phone, user.id);
            await fetchUnreadCount(user.id);
            await fetchNotifications(user.id);
        } catch (error) {
            console.error('Error refreshing user data:', error);
            throw error;
        }
    };

    const refreshAppointments = () => {
        if (user?.phone) {
            return appointmentStore.fetchAppointments(user.phone, user.id, true);
        }
    };

    const retry = () => {
        appointmentStore.setError(null);
        if (user?.phone) {
            appointmentStore.fetchAppointments(user.phone, user.id, true);
        }
    };

    return {
        user,
        appointments: appointmentStore.appointments,
        loading: appointmentStore.loading,
        refreshing: appointmentStore.refreshing,
        error: appointmentStore.error,
        getUpcomingAppointments: appointmentStore.getUpcomingAppointments,
        refresh,
        refreshAppointments,
        retry,
        appointmentStore,
    };
};

export default useUserAppointments;