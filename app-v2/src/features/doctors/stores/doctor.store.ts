import { create } from 'zustand';
import { Doctor } from '@/shared/types';
import { DoctorService } from '../services/doctor.service';

interface DoctorState {
    doctors: Doctor[];
    topDoctors: Doctor[];
    filteredDoctors: Doctor[];
    isLoading: boolean;
    isTopDoctorsLoading: boolean;
    error: string | null;
    searchQuery: string;

    // Actions
    fetchDoctors: (search?: string) => Promise<void>;
    fetchTopDoctors: () => Promise<void>;
    setSearchQuery: (query: string) => void;
    getDoctorById: (id: string) => Promise<Doctor | null>;
    clearError: () => void;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
    doctors: [],
    topDoctors: [],
    filteredDoctors: [],
    isLoading: false,
    isTopDoctorsLoading: false,
    error: null,
    searchQuery: '',

    fetchDoctors: async (search) => {
        set({ isLoading: true, error: null });
        try {
            const doctors = await DoctorService.getDoctors(search);
            set({
                doctors,
                filteredDoctors: doctors,
                isLoading: false,
                searchQuery: search || ''
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchTopDoctors: async () => {
        set({ isTopDoctorsLoading: true, error: null });
        try {
            const topDoctors = await DoctorService.getTopDoctors();
            set({ topDoctors, isTopDoctorsLoading: false });
        } catch (error: any) {
            set({ error: error.message, isTopDoctorsLoading: false });
        }
    },

    setSearchQuery: (query) => {
        const { doctors } = get();
        const filtered = doctors.filter(doctor =>
            doctor.name.toLowerCase().includes(query.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(query.toLowerCase())
        );
        set({ searchQuery: query, filteredDoctors: filtered });
    },

    getDoctorById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const doctor = await DoctorService.getDoctorById(id);
            set({ isLoading: false });
            return doctor;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            return null;
        }
    },

    clearError: () => set({ error: null }),
}));
