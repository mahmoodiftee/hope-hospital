import { useCallback } from 'react';
import { useDoctorStore } from '../stores/doctor.store';

/**
 * useDoctorSearch hook provides a simple interface for searching doctors.
 */
export const useDoctorSearch = () => {
    const searchQuery = useDoctorStore((state) => state.searchQuery);
    const setSearchQuery = useDoctorStore((state) => state.setSearchQuery);
    const fetchDoctors = useDoctorStore((state) => state.fetchDoctors);
    const filteredDoctors = useDoctorStore((state) => state.filteredDoctors);
    const isLoading = useDoctorStore((state) => state.isLoading);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, [setSearchQuery]);

    const search = useCallback((query: string) => {
        setSearchQuery(query);
    }, [setSearchQuery]);

    return {
        searchQuery,
        search,
        clearSearch,
        filteredDoctors,
        isLoading,
        fetchDoctors,
    };
};

export default useDoctorSearch;
