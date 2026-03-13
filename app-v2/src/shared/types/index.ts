// Shared types — used across multiple features.
// Feature-specific types live inside each feature's own types/index.ts.

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    name: string;
    age: number;
    phone: string;
    createdAt: string;
    avatar?: string;
    favorites?: string[];
}

export interface DbUser {
    $id: string;
    name: string;
    age: number;
    phone: string;
    favorites?: string[];
}

// ─── Doctor ───────────────────────────────────────────────────────────────────
export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    hourlyRate: number;
    image: string;
    experience: string;
    specialties?: string[];
    reviews?: Review[];
}

// ─── Appointment ──────────────────────────────────────────────────────────────
export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface Appointment {
    $id?: string;
    doctorId: string;
    doctor_name: string;
    specialty: string;
    amount: number;
    date: string;        // YYYY-MM-DD
    time: string;        // e.g. "10:00 AM"
    userId: string;
    patient_name: string;
    patient_age: number;
    contactNumber: string;
    status?: AppointmentStatus;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
    $id?: string;
    appointmentId: string;
    doctorId: string;
    patientName: string;
    rating: number;      // 1–5
    review: string;
    userId: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType =
    | 'appointment_confirmation'
    | 'appointment_reminder'
    | 'appointment_reschedule'
    | 'appointment_cancelled';

export interface Notification {
    $id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    appointmentId?: string;
    scheduledAt: string;
    isPushed: boolean;
    priority: 1 | 2 | 3;  // 1=low, 2=medium, 3=high
    metadata?: string;     // JSON string
    $createdAt?: string;   // Appwrite system field
}

// ─── Time Slot ────────────────────────────────────────────────────────────────
export type TimeSlotStatus = 'available' | 'not_available' | 'time_passed';

export interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
    status: TimeSlotStatus;
    label: string;
}

// ─── Validation ────────────────────────────────────────────────────────────────
export interface ValidationErrors {
    name: string;
    age: string;
    phone: string;
    date: string;
    time: string;
}
