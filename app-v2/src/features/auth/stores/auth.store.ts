import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, DbUser } from '@/shared/types';
import { AuthService } from '../services/auth.service';
import { registerPushToken } from '@/shared/services/pushToken.service';

interface AuthState {
    user: User | null;
    dbUser: DbUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setSession: (user: User, dbUser: DbUser) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    setLoading: (loading: boolean) => void;
    toggleFavorite: (doctorId: string) => Promise<void>;
}

const USER_STORAGE_KEY = 'user';

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    dbUser: null,
    isAuthenticated: false,
    isLoading: true,

    setSession: async (user, dbUser) => {
        try {
            // Load local favorites if any to merge into session
            const localFavsKey = `favorites_${dbUser.$id || user.id}`;
            const localFavs = await SecureStore.getItemAsync(localFavsKey);
            let favorites = dbUser.favorites || [];

            if (localFavs) {
                const parsedLocal = JSON.parse(localFavs) as string[];
                // Merge unique IDs
                favorites = Array.from(new Set([...favorites, ...parsedLocal]));
            }

            const mergedDbUser = { ...dbUser, favorites };
            await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));
            set({ user, dbUser: mergedDbUser, isAuthenticated: true, isLoading: false });

            // CRITICAL FIX: Register push token on every successful login
            await registerPushToken(user.id || mergedDbUser.$id);
        } catch (error) {
            console.error('[AuthStore] setSession error:', error);
        }
    },

    logout: async () => {
        try {
            await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
            set({ user: null, dbUser: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
            console.error('[AuthStore] logout error:', error);
        }
    },

    initializeAuth: async () => {
        set({ isLoading: true });
        try {
            const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser) as User;
                const dbUser = await AuthService.getUser(parsedUser.phone);

                if (dbUser) {
                    // Load local favorites
                    const localFavsKey = `favorites_${dbUser.$id || parsedUser.id}`;
                    const localFavs = await SecureStore.getItemAsync(localFavsKey);
                    let favorites = dbUser.favorites || [];

                    if (localFavs) {
                        const parsedLocal = JSON.parse(localFavs) as string[];
                        favorites = Array.from(new Set([...favorites, ...parsedLocal]));
                    }

                    const mergedDbUser = { ...dbUser, favorites };

                    set({
                        user: parsedUser,
                        dbUser: mergedDbUser,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    // CRITICAL FIX: Ensure push token is registered for existing session on app boot
                    await registerPushToken(parsedUser.id || mergedDbUser.$id);
                    return;
                }
            }

            set({ user: null, dbUser: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
            console.error('[AuthStore] initializeAuth error:', error);
            set({ user: null, dbUser: null, isAuthenticated: false, isLoading: false });
        }
    },

    setLoading: (loading) => set({ isLoading: loading }),

    toggleFavorite: async (doctorId) => {
        const { dbUser, isAuthenticated } = get();
        if (!isAuthenticated || !dbUser?.$id) return;

        const currentFavs = dbUser.favorites || [];
        let newFavorites = [...currentFavs];
        const index = newFavorites.indexOf(doctorId);

        if (index > -1) {
            newFavorites.splice(index, 1);
        } else {
            newFavorites.push(doctorId);
        }

        // 1. Pessimistically update local state first for instant feedback
        const localFavsKey = `favorites_${dbUser.$id}`;
        try {
            await SecureStore.setItemAsync(localFavsKey, JSON.stringify(newFavorites));
            set({ dbUser: { ...dbUser, favorites: newFavorites } });
        } catch (e) {
            console.error('[AuthStore] local storage fallback error:', e);
        }

        // 2. Try to sync to server
        try {
            const updatedDbUser = await AuthService.toggleFavoriteDoctor(
                dbUser.$id,
                doctorId,
                currentFavs
            );
            // If server succeeds, update again with server's truth
            set({ dbUser: updatedDbUser });
        } catch (error) {
            // If server fails (e.g. schema error), we still have local favs working
            console.warn('[AuthStore] server sync failed, using local favorites:', error);
        }
    },
}));
