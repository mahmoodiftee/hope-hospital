import { ID, Query } from 'react-native-appwrite';
import { databases, config } from '@/config/appwrite.config';
import { Appointment, AppointmentStatus, Notification, NotificationType, Review } from '@/shared/types';

export class AppointmentService {
    // ─── Phone Normalization ───────────────────────────────────────────────────
    private static normalizePhone(phone: string): string {
        const trimmed = phone.trim().replace(/\s+/g, '');
        if (trimmed.startsWith('+8801')) return '0' + trimmed.slice(4);
        if (trimmed.startsWith('8801')) return '0' + trimmed.slice(3);
        return trimmed;
    }

    // ─── Appointments: Read ───────────────────────────────────────────────────

    static async getAppointments(params: { phone?: string; userId?: string }): Promise<Appointment[]> {
        try {
            const { phone, userId } = params;
            const filters: any[] = [];

            if (phone) {
                filters.push(Query.equal('contactNumber', this.normalizePhone(phone)));
            }
            if (userId) {
                filters.push(Query.equal('userId.$id', userId));
            }
            filters.push(Query.orderDesc('$createdAt'));

            const response = await databases.listDocuments(
                config.databaseId,
                config.appointmentsCollectionId,
                filters
            );

            return response.documents as unknown as Appointment[];
        } catch (error: any) {
            console.error('[AppointmentService] getAppointments error:', error);
            throw new Error(error.message || 'Failed to fetch appointments');
        }
    }

    // ─── Appointments: Conflict Check ─────────────────────────────────────────

    /**
     * Returns true if the slot is already booked (by someone other than excludeId).
     */
    static async checkSlotConflict(
        doctorId: string,
        date: string,
        time: string,
        excludeId?: string
    ): Promise<boolean> {
        try {
            const filters: any[] = [
                Query.equal('doctorId', doctorId),
                Query.equal('date', date),
                Query.equal('time', time),
            ];
            if (excludeId) {
                filters.push(Query.notEqual('$id', excludeId));
            }

            const response = await databases.listDocuments(
                config.databaseId,
                config.appointmentsCollectionId,
                filters
            );

            // Filter out appointments that are already cancelled
            const activeAppointments = response.documents.filter(
                (doc: any) => doc.status !== 'Cancelled'
            );

            return activeAppointments.length > 0;
        } catch (error: any) {
            console.error('[AppointmentService] checkSlotConflict error:', error);
            return false; // Fail-open: don't block booking on network error
        }
    }

    // ─── Appointments: Create ─────────────────────────────────────────────────

    /**
     * Books a new appointment. Returns 200 on success, 409 on conflict, 500 on error.
     */
    static async bookAppointment(appointmentData: Appointment): Promise<{ status: number; data?: Appointment }> {
        try {
            const conflict = await this.checkSlotConflict(
                appointmentData.doctorId as string,
                appointmentData.date,
                appointmentData.time
            );
            if (conflict) return { status: 409 };

            const response = await databases.createDocument(
                config.databaseId,
                config.appointmentsCollectionId,
                ID.unique(),
                { ...appointmentData, status: 'Upcoming' }
            );

            return { status: 200, data: response as unknown as Appointment };
        } catch (error: any) {
            console.error('[AppointmentService] bookAppointment error:', error);
            return { status: 500 };
        }
    }

    // ─── Appointments: Update (Reschedule) ────────────────────────────────────

    /**
     * Reschedules an existing appointment. Returns 200, 404, 409, or 500.
     */
    static async rescheduleAppointment(
        id: string,
        appointmentData: Partial<Appointment>
    ): Promise<{ status: number; data?: Appointment }> {
        try {
            // Verify exists
            const existing = await databases.listDocuments(
                config.databaseId,
                config.appointmentsCollectionId,
                [Query.equal('$id', id)]
            );
            if (existing.total === 0) return { status: 404 };

            // Conflict check (exclude this appointment itself)
            const conflict = await this.checkSlotConflict(
                appointmentData.doctorId as string,
                appointmentData.date!,
                appointmentData.time!,
                id
            );
            if (conflict) return { status: 409 };

            const updated = await databases.updateDocument(
                config.databaseId,
                config.appointmentsCollectionId,
                id,
                appointmentData
            );

            return { status: 200, data: updated as unknown as Appointment };
        } catch (error: any) {
            console.error('[AppointmentService] rescheduleAppointment error:', error);
            return { status: 500 };
        }
    }

    // ─── Appointments: Cancel ─────────────────────────────────────────────────

    static async updateAppointmentStatus(
        appointmentId: string,
        status: AppointmentStatus
    ): Promise<{ status: number }> {
        try {
            const existing = await databases.listDocuments(
                config.databaseId,
                config.appointmentsCollectionId,
                [Query.equal('$id', appointmentId)]
            );
            if (existing.total === 0) return { status: 404 };

            await databases.updateDocument(
                config.databaseId,
                config.appointmentsCollectionId,
                appointmentId,
                { status }
            );
            return { status: 200 };
        } catch (error: any) {
            console.error('[AppointmentService] updateStatus error:', error);
            return { status: 500 };
        }
    }

    // ─── Doctor Time Slots ────────────────────────────────────────────────────

    /**
     * Fetches a doctor's available schedule from the `timeslots` collection.
     * Returns { day: string[], time: string[] } or null if no record found.
     */
    static async getDoctorTimeSlots(doctorId: string): Promise<{ day: string[]; time: string[] } | null> {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                config.timeSlotsCollectionId,
                [Query.equal('docId', doctorId)]
            );

            if (!response.total || response.documents.length === 0) return null;

            const doc = response.documents[0];
            return {
                day: doc.day ?? [],
                time: doc.time ?? [],
            };
        } catch (error: any) {
            console.error('[AppointmentService] getDoctorTimeSlots error:', error);
            return null;
        }
    }

    // ─── Notifications ────────────────────────────────────────────────────────

    static async createNotification(payload: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        priority?: 1 | 2 | 3;
        appointmentId?: string;
        scheduledAt?: string;
        metadata?: Record<string, any>;
    }): Promise<void> {
        try {
            const doc = {
                userId: payload.userId,
                type: payload.type,
                title: payload.title,
                message: payload.message,
                isRead: false,
                isPushed: false,
                priority: payload.priority ?? 3,
                scheduledAt: payload.scheduledAt ?? new Date().toISOString(),
                ...(payload.appointmentId && { appointmentId: payload.appointmentId }),
                ...(payload.metadata && { metadata: JSON.stringify(payload.metadata) }),
            };
            await databases.createDocument(
                config.databaseId,
                config.notificationsCollectionId,
                ID.unique(),
                doc
            );
        } catch (error) {
            // Notification failure should never block the booking flow
            console.warn('[AppointmentService] createNotification failed (non-blocking):', error);
        }
    }

    static async getAppointmentNotifications(appointmentId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                config.notificationsCollectionId,
                [Query.equal('appointmentId', appointmentId), Query.orderDesc('$createdAt')]
            );
            return response.documents;
        } catch (error) {
            console.warn('[AppointmentService] getAppointmentNotifications error:', error);
            return [];
        }
    }

    static async deleteNotification(notificationId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                config.databaseId,
                config.notificationsCollectionId,
                notificationId
            );
        } catch (error) {
            console.warn('[AppointmentService] deleteNotification error:', error);
        }
    }

    // ─── Reviews ─────────────────────────────────────────────────────────────

    static async checkReviewExists(appointmentId: string, userId: string): Promise<boolean> {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                config.reviewsCollectionId,
                [
                    Query.equal('appointmentId', appointmentId),
                    Query.equal('userId', userId),
                ]
            );
            return response.total > 0;
        } catch (error) {
            console.warn('[AppointmentService] checkReviewExists error:', error);
            return false;
        }
    }

    static async insertReview(payload: {
        appointmentId: string;
        doctorId: string;
        patientName: string;
        rating: number;
        review: string;
        userId: string;
    }): Promise<void> {
        try {
            await databases.createDocument(
                config.databaseId,
                config.reviewsCollectionId,
                ID.unique(),
                payload
            );
        } catch (error: any) {
            console.error('[AppointmentService] insertReview error:', error);
            throw new Error(error.message || 'Failed to submit review');
        }
    }
}
