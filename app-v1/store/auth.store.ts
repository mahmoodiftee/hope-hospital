import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getUser } from "@/lib/appwrite";

type AuthState = {
    isAuthenticated: boolean;
    user: any | null;
    dbUser: any | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: any | null) => void;
    setDbUser: (user: any | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: (phone?: string) => Promise<void>;
};

const USER_KEY = 'user';

const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    user: null,
    dbUser: null,
    isLoading: false, // Start with false instead of true

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setDbUser: (user) => set({ dbUser: user }),
    setLoading: (value) => set({ isLoading: value }),

    fetchAuthenticatedUser: async (phone?: string) => {
        // Only set loading if we're not already loading
        if (!get().isLoading) {
            set({ isLoading: true });
        }

        try {
            let user: any = null;
            const userJson = await SecureStore.getItemAsync(USER_KEY);

            if (userJson) {
                user = JSON.parse(userJson);
                // console.log('Found user in SecureStore:', user);
            }

            const phoneToUse = user?.phone || phone;

            if (phoneToUse) {
                try {
                    const dbUser = await getUser({ phone: phoneToUse });
                    set({
                        dbUser: dbUser || null,
                        user: user,
                        isAuthenticated: !!user,
                        isLoading: false
                    });
                } catch (dbError) {
                    console.log('Error fetching dbUser:', dbError);
                    set({
                        dbUser: null,
                        user: user,
                        isAuthenticated: !!user,
                        isLoading: false
                    });
                }
            } else {
                set({
                    dbUser: null,
                    user: user,
                    isAuthenticated: !!user,
                    isLoading: false
                });
            }

        } catch (e) {
            console.log('fetchAuthenticatedUser error', e);
            set({
                isAuthenticated: false,
                user: null,
                dbUser: null,
                isLoading: false
            });
        }
    }
}));

export default useAuthStore;