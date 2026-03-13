import { useState } from 'react';

export const useDoctorBooking = () => {
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

    const handleBookNow = (doctorId: string) => {
        setSelectedDoctorId(doctorId);
        setShowBookingModal(true);
    };

    const handleBookingClose = () => {
        setShowBookingModal(false);
        setSelectedDoctorId('');
    };

    return {
        showBookingModal,
        selectedDoctorId,
        handleBookNow,
        handleBookingClose,
    };
};