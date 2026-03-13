import AppointmentBooking from '@/components/AppointmentBookingComponents/AppointmentBooking'
import { getDoctor } from '@/lib/appwrite'
import useAppwrite from '@/lib/useAppwrite'
import { Appointment } from '@/types'
import React from 'react'
import { Modal } from 'react-native'

interface AppointmentBookingModalProps {
    appointment: Appointment
    visible: boolean
    onClose: () => void
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
    appointment,
    visible,
    onClose
}) => {
    //@ts-ignore
    const doctorId = appointment?.doctorId?.$id || null

    const { data: modalDoctor } = useAppwrite({
        fn: getDoctor,
        params: { id: doctorId! },
        skip: !doctorId,
    })

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <AppointmentBooking
                doctor={modalDoctor!}
                rescheduleDetails={appointment.status === 'Cancelled' ? undefined : appointment}
                onClose={onClose}
                reschedule={appointment.status !== 'Cancelled'}
            />
        </Modal>
    )
}