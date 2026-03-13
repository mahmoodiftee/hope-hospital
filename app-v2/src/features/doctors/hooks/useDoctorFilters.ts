import { useState, useCallback, useMemo } from 'react';
import { Doctor } from '@/shared/types';

/**
 * useDoctorFilters hook provides advanced filtering logic for doctors
 * (e.g., by specialty, price range, experience).
 */
export const useDoctorFilters = (doctors: Doctor[]) => {
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

    const specialties = useMemo(() => {
        const all = doctors.map(d => d.specialty);
        return Array.from(new Set(all));
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        if (!selectedSpecialty) return doctors;
        return doctors.filter(d => d.specialty === selectedSpecialty);
    }, [doctors, selectedSpecialty]);

    const toggleSpecialty = useCallback((specialty: string) => {
        setSelectedSpecialty(prev => prev === specialty ? null : specialty);
    }, []);

    return {
        selectedSpecialty,
        toggleSpecialty,
        specialties,
        filteredDoctors,
    };
};

