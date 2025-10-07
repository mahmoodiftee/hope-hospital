
// Keep all the interfaces that are used in props
export interface AppointmentBookingProps {
    doctor: Doctor;
    onClose: () => void;
    rescheduleDetails?: Appointment;
    reschedule?: boolean;
}

export interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
    status: string;
}

export interface PatientInfo {
    name: string;
    age: string;
    phone: string;
}

export interface ValidationErrors {
    name: string;
    age: string;
    phone: string;
    date: string;
    time: string;
}

export interface Review {
    rating: number;
    review: string;
    patientName: string;
}

export interface Doctor {
    $id?: string;
    id: string;
    name: string;
    specialty: string;
    hourlyRate: number;
    image: string;
    experience: string;
    specialties: string[];
    reviews?: Review[]; // optional in case no reviews
}

export interface Appointment {
    id?: string;
    $id?: string;
    doctorId: string;
    doctor_name: string;
    specialty: string;
    amount: number;
    date: string;
    time: string;
    userId: string;
    patient_name: string;
    patient_age: number;
    contactNumber: string;
    status?: string;
    $createdAt: string;
    patientName: string;
    patientPhone: string;
    appointmentDateTime: string;
    doctorName?: string;
    doctorImage?: string;
    doctorSpecialty?: string;
    location?: string;
    notes?: string;
}

export interface DoctorAvailability {
    doctorId: string;
    availableDays: string[];
    availableTimes: string[];
}
