import { useState, useCallback } from 'react';
import { Prescription } from '../types';

// Mock data from original MedicalHistory.tsx
export const MOCK_PRESCRIPTIONS: Prescription[] = [
    {
        id: "1",
        type: "Prescription",
        title: "Prescription from Dr. Mahabub Alom",
        date: "May 13, 2024",
        icon: "document-text-outline",
        iconBg: "#E8F5E9",
        iconColor: "#34A853",
        viewText: "View Prescription",
        viewColor: "#10B981"
    },
    {
        id: "2",
        type: "Blood Test",
        title: "Blood Test Report",
        date: "May 25, 2024",
        icon: "water-outline",
        iconBg: "#E3F2FD",
        iconColor: "#1A73E8",
        viewText: "View Test Report",
        viewColor: "#3B82F6"
    },
    {
        id: "3",
        type: "Certificate",
        title: "Medical Certificate",
        date: "June 1, 2023",
        icon: "ribbon-outline",
        iconBg: "#FFF8E1",
        iconColor: "#F9AB00",
        viewText: "View Certificate",
        viewColor: "#F59E0B"
    }
];

export default function usePrescriptions() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPrescriptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            setPrescriptions(MOCK_PRESCRIPTIONS);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch prescriptions');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        prescriptions,
        isLoading,
        error,
        fetchPrescriptions
    };
}
