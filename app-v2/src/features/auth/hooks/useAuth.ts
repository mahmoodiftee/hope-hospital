import { useAuthStore } from '../stores/auth.store';

/**
 * useAuth hook provides a convenient interface to the AuthStore.
 * It exposes authentication state and actions for use in components.
 */
export const useAuth = () => {
    const user = useAuthStore((state) => state.user);
    const dbUser = useAuthStore((state) => state.dbUser);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);

    const setSession = useAuthStore((state) => state.setSession);
    const logout = useAuthStore((state) => state.logout);
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const setLoading = useAuthStore((state) => state.setLoading);
    const toggleFavorite = useAuthStore((state) => state.toggleFavorite);

    return {
        user,
        dbUser,
        isAuthenticated,
        isLoading,
        setSession,
        logout,
        initializeAuth,
        setLoading,
        toggleFavorite,
    };
};
