import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";
import { Appointment, Doctor, DoctorAvailability, Review } from "../types";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.hope.hospital",
    databaseId: '687535c30001472b370a',
    userCollectionId: '6880a6e4003bb8eb1daf',
    doctorsCollectionId: '687cde58003e3a481b07',
    reviewsCollectionId: '68811f370016887ed420',
    appointmentsCollectionId: '687ceabe0022244f6e7d',
    availableSlotsCollectionId: '687e377a00203492fd21',
    notificationsCollectionId: '6885dcb70003c0ad4c75',
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

const convertTo24Hour = (time12h: any) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};
// Utility function to normalize phone number
const normalizePhone = (phone: string): string => {
    const trimmed = phone.trim().replace(/\s+/g, '');
    if (trimmed.startsWith('+8801')) return '0' + trimmed.slice(4);
    if (trimmed.startsWith('8801')) return '0' + trimmed.slice(3);
    return trimmed;
};

const createAppointmentDateTime = (dateString: any, timeString: any) => {
    try {
        const time24h = convertTo24Hour(timeString);
        const appointmentDateTime = new Date(`${dateString}T${time24h}:00`);

        if (isNaN(appointmentDateTime.getTime())) {
            throw new Error(`Invalid date/time format: ${dateString} ${timeString}`);
        }

        return appointmentDateTime;
    } catch (error) {
        console.error('Error creating appointment date time:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const session = await account.get();
        if (!session) {
            console.log("No active session to logout from");
            return;
        }
        await account.deleteSession("current");
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    }
};

export const saveUserToDB = async ({ name, age, phone }: { name: string; age: number; phone: string; }) => {
    return await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        { name, age, phone }
    );
};


export const getUser = async ({ phone }: { phone: string }) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("phone", phone)]
        );

        if (response.total > 0) {
            return response.documents[0] as unknown;
        }
    } catch (e: any) {
        throw new Error(e.message || "Failed to query user by phone.");
    }
};

export const userExistCheck = async ({ phone }: { phone: string }) => {
    try {
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("phone", phone)]
        );

        if (res.documents.length > 0) {
            return {
                exists: true,
                user: res.documents[0]
            };
        }

        return { exists: false };
    } catch (error) {
        console.error("Failed to check user existence:", error);
        throw error;
    }
};

export const getAppointments = async (params: { phone?: string; userId?: string }): Promise<Appointment[] | null> => {
    try {
        const { phone, userId } = params;

        if (!phone && !userId) {
            console.warn('getAppointments called without phone or userId');
            return [];
        }

        let filters: any[] = [];

        if (phone) {
            console.log('getAppointments called with phone:', phone);

            if (phone.trim() === '') {
                console.warn('getAppointments called with empty phone number');
                return [];
            }

            const normalizedPhone = normalizePhone(phone);
            console.log('Normalized phone:', normalizedPhone);

            filters.push(Query.equal("contactNumber", normalizedPhone));
        }

        if (userId) {
            console.log('getAppointments called with userId:', userId);
            filters.push(Query.equal("userId.$id", userId));
        }

        // Always order by latest created
        filters.push(Query.orderDesc("$createdAt"));

        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.appointmentsCollectionId,
            filters
        );

        console.log('Database response:', response.documents.length, 'appointments found');
        return response.documents as unknown as Appointment[];

    } catch (e: any) {
        console.error('Error in getAppointments:', e);
        throw new Error(e.message || "Failed to query appointments.");
    }
};


export const insertReview = async ({
    appointmentId,
    doctorId,
    patientName,
    rating,
    review,
    userId
}: {
    appointmentId: string;
    doctorId: string;
    patientName: string;
    rating: number;
    review: string;
    userId: string;
}) => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.reviewsCollectionId,
            ID.unique(),
            {
                appointmentId,
                doctorId,
                patientName,
                rating,
                review,
                userId
            }
        );
        console.log('Review inserted:', response.$id);
        return response;
    } catch (error) {
        console.error('Error inserting review:', error);
        throw error;
    }
};

export const getUserReview = async ({
    appointmentId,
    userId,
}: {
    appointmentId: string;
    userId: string;
}): Promise<any | null> => {
    if (!appointmentId || !userId) {
        console.warn("Missing appointmentId or userId in getUserReview");
        return null;
    }

    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.reviewsCollectionId,
            [
                Query.equal("appointmentId", appointmentId),
                Query.equal("userId", userId),
            ]
        );

        return response.total > 0 ? response.documents[0] as any : null;
    } catch (error) {
        console.error("Error fetching user review:", error);
        throw new Error("Failed to check existing review.");
    }
};


export const getDoctor = async ({ id }: { id: string }): Promise<Doctor | null> => {
    try {
        const doc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.doctorsCollectionId,
            id
        );

        const reviewsRes = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.reviewsCollectionId,
            [Query.equal("doctorId", id)]
        );

        const reviews: Review[] = reviewsRes.documents.map((doc) => ({
            rating: doc.rating as number,
            review: doc.review,
            patientName: doc.patientName,
        }));

        const doctor: Doctor = {
            id: doc.$id,
            name: doc.name,
            specialty: doc.specialty,
            hourlyRate: doc.hourlyRate,
            image: doc.image,
            experience: doc.experience,
            specialties: doc.specialties ?? [],
            reviews,
        };

        return doctor;
    } catch (error) {
        console.error("Error fetching doctor and reviews:", error);
        throw new Error("Failed to load doctor data.");
    }
};

export async function getAllDoctors({
    filter,
    query,
    limit,
}: {
    filter: string;
    query: string;
    limit?: number;
}) {
    try {
        const buildQuery = [Query.orderDesc("$createdAt")];

        if (filter && filter !== "" && filter !== "All") {
            buildQuery.push(Query.contains("specialty", filter));
        }

        if (query) {
            try {
                buildQuery.push(
                    Query.or([
                        Query.search("name", query),
                        Query.search("specialty", query),
                    ])
                );
            } catch (searchError) {
                console.log("Fulltext search failed, falling back to contains search", searchError);
                buildQuery.push(
                    Query.or([
                        Query.contains("name", query),
                        Query.contains("specialty", query),
                    ])
                );
            }
        }

        if (limit) buildQuery.push(Query.limit(limit));

        let result;
        try {
            result = await databases.listDocuments(
                appwriteConfig.databaseId!,
                appwriteConfig.doctorsCollectionId!,
                buildQuery
            );
        } catch (error) {
            console.log("Database query failed, trying client-side filtering", error);

        }

        return result!.documents;
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return [];
    }
}

export async function insertAppointment(appointment: Appointment): Promise<{ status: number, data?: any }> {
    try {
        // Validate required fields
        if (!appointment.doctorId || !appointment.date || !appointment.time) {
            console.error("Missing required appointment fields");
            return { status: 400 }; // Bad request
        }

        const bookingExists = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.appointmentsCollectionId,
            [
                Query.equal("doctorId", appointment.doctorId),
                Query.equal("date", appointment.date),
                Query.equal("time", appointment.time)
            ]
        );

        if (bookingExists.total > 0) {
            return { status: 409 };
        }

        const newAppointment = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.appointmentsCollectionId,
            ID.unique(),
            appointment
        );

        return { status: 200, data: newAppointment };
    } catch (error: any) {
        console.error("Error booking appointment:", error);
        console.log("Appointment data that caused error:", appointment);
        return { status: 500 };
    }
}

export const cancelAppointment = async (appointment: Appointment, id: string): Promise<{ status: number, data?: any }> => {
    try {
        const existingAppointment = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.appointmentsCollectionId,
            [Query.equal("$id", id)]
        );

        if (existingAppointment.total === 0) {
            return { status: 404 };
        }

        const newAppointment = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.appointmentsCollectionId,
            id,
            {
                status: "Cancelled"
            }
        );

        return { status: 200, data: newAppointment };
    } catch (error: any) {
        console.error("Error booking appointment:", error);
        return { status: 500 };
    }
}

export const updateAppointment = async (appointment: Appointment, id: string): Promise<{ status: number, data?: any }> => {
    try {
        const existingAppointment = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.appointmentsCollectionId,
            [Query.equal("$id", id)]
        );

        if (existingAppointment.total === 0) {
            return { status: 404 };
        }

        const timeSlotConflict = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.appointmentsCollectionId,
            [
                Query.equal("doctorId", appointment.doctorId),
                Query.equal("date", appointment.date),
                Query.equal("time", appointment.time),
                Query.notEqual("$id", id)
            ]
        );

        if (timeSlotConflict.total > 0) {
            return { status: 409 };
        }

        const updatedAppointment = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.appointmentsCollectionId,
            id,
            appointment
        );

        return { status: 200, data: updatedAppointment };
    } catch (error: any) {
        console.error("Error updating appointment:", error);
        return { status: 500 };
    }
};

export const getSingleDoctorAvailableSlots = async ({ id }: { id: string; }): Promise<DoctorAvailability | null> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.availableSlotsCollectionId,
            [Query.equal("doctorId", id)]
        );

        if (!response.total || response.documents.length === 0) {
            return null;
        }

        const doc = response.documents[0];
        return {
            doctorId: doc.doctorId,
            availableDays: doc.availableDays,
            availableTimes: doc.availableTimes,
        } as DoctorAvailability;
    } catch (error) {
        console.error("Error fetching doctor's available slots:", error);
        throw new Error("Failed to load doctor availability.");
    }
};

export const createAppointmentConfirmationNotification = async (appointmentData: any, appointmentId: any, userId: any) => {
    try {
        const notification = {
            userId: userId,
            type: 'appointment_confirmation',
            title: 'Appointment Confirmed',
            message: `Your appointment with ${appointmentData.doctor_name} has been confirmed for ${appointmentData.date} at ${appointmentData.time}.`,
            isRead: false,
            appointmentId: appointmentId,
            scheduledAt: new Date().toISOString(),
            isPushed: false,
            priority: 3, //high priority
            metadata: JSON.stringify({
                doctorName: appointmentData.doctor_name,
                specialty: appointmentData.specialty,
                date: appointmentData.date,
                time: appointmentData.time,
                amount: appointmentData.amount,
                notificationType: 'confirmation'
            })
        };

        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            ID.unique(),
            notification
        );

        console.log('Appointment confirmation notification created:', response.$id);
        return response;
    } catch (error) {
        console.error('Error creating appointment confirmation notification:', error);
        throw error;
    }
};

export const createAppointmentReminderNotifications = async (appointmentData: any, appointmentId: any, userId: any) => {
    try {
        // Create proper appointment DateTime using helper function
        const appointmentDateTime = createAppointmentDateTime(appointmentData.date, appointmentData.time);

        // Calculate 2 hours before the appointment
        const twoHoursBefore = new Date(appointmentDateTime.getTime() - (2 * 60 * 60 * 1000));

        // Only create reminder if it's in the future
        const now = new Date();
        if (twoHoursBefore <= now) {
            console.log('Appointment is too soon for reminder notification');
            return [];
        }

        const reminder = {
            userId: userId,
            type: 'appointment_reminder',
            title: 'Appointment Reminder - Only 2 Hours to go',
            message: `Reminder: You have an appointment with ${appointmentData.doctor_name} in 2 hours at ${appointmentData.time}.`,
            isRead: false,
            appointmentId: appointmentId,
            scheduledAt: twoHoursBefore.toISOString(),
            isPushed: false,
            priority: 1, //low priority
            metadata: JSON.stringify({
                doctorName: appointmentData.doctor_name,
                specialty: appointmentData.specialty,
                date: appointmentData.date,
                time: appointmentData.time,
                reminderType: '2_hours_before',
                notificationType: 'reminder'
            })
        };

        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            ID.unique(),
            reminder
        );

        console.log('Appointment 2-hour reminder notification created:', response.$id);
        return [response];
    } catch (error) {
        console.error('Error creating appointment reminder notification:', error);
        throw error;
    }
};

export const createAppointmentRescheduleConfirmationNotification = async (appointmentData: any, appointmentId: any, userId: any, oldDate: any, oldTime: any) => {
    try {
        const notification = {
            userId: userId,
            type: 'appointment_reschedule',
            title: 'Appointment Rescheduled',
            message: `Your appointment with ${appointmentData.doctor_name} has been rescheduled from ${oldDate} ${oldTime} to ${appointmentData.date} ${appointmentData.time}.`,
            isRead: false,
            appointmentId: appointmentId,
            scheduledAt: new Date().toISOString(),
            isPushed: false,
            priority: 3, // High priority
            metadata: JSON.stringify({
                doctorName: appointmentData.doctor_name,
                specialty: appointmentData.specialty,
                newDate: appointmentData.date,
                newTime: appointmentData.time,
                oldDate: oldDate,
                oldTime: oldTime,
                notificationType: 'reschedule'
            })
        };

        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            ID.unique(),
            notification
        );

        console.log('Appointment reschedule notification created:', response.$id);
        return response;
    } catch (error) {
        console.error('Error creating appointment reschedule notification:', error);
        throw error;
    }
};

export const createAppointmentCancelledNotification = async (appointmentData: any, appointmentId: any, userId: any) => {
    try {
        const notification = {
            userId: userId,
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled',
            message: `Your appointment with ${appointmentData.doctor_name} has been cancelled.`,
            isRead: false,
            appointmentId: appointmentId,
            scheduledAt: new Date().toISOString(),
            isPushed: false,
            priority: 3,
            metadata: JSON.stringify({
                doctorName: appointmentData.doctor_name,
                specialty: appointmentData.specialty,
                date: appointmentData.date,
                time: appointmentData.time,
                amount: appointmentData.amount,
                notificationType: 'cancelled'
            })
        };

        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            ID.unique(),
            notification
        );

        console.log('Appointment cancelled notification created:', response.$id);
        return response;
    } catch (error) {
        console.error('Error creating appointment cancelled notification:', error);
        throw error;
    }
};

export const createGeneralNotification = async (userId: any, type: any, title: any, message: any, priority = 2, metadata = null) => {
    try {
        const notification = {
            userId: userId,
            type: type,
            title: title,
            message: message,
            isRead: false,
            scheduledAt: new Date().toISOString(),
            isPushed: false,
            priority: priority,
            metadata: metadata ? JSON.stringify(metadata) : null
        };

        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            ID.unique(),
            notification
        );

        return response;
    } catch (error) {
        console.error('Error creating general notification:', error);
        throw error;
    }
};

export const getUserNotifications = async (userId: string, limit = 50, offset = 0) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            [
                Query.equal('userId', userId),
                Query.orderDesc('$createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ]
        );

        return response;
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        throw error;
    }
};

export const getUnreadNotificationsCount = async (userId: string) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            [
                Query.equal('userId', userId),
                Query.equal('isRead', false),
                Query.limit(1000)
            ]
        );

        return response.total;
    } catch (error) {
        console.error('Error fetching unread notifications count:', error);
        throw error;
    }
};

export const getUserNotificationsByType = async (userId: any, type: any, limit = 20) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            [
                Query.equal('userId', userId),
                Query.equal('type', type),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );

        return response;
    } catch (error) {
        console.error('Error fetching notifications by type:', error);
        throw error;
    }
};

export const getScheduledNotifications = async () => {
    try {
        const now = new Date().toISOString();
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            [
                Query.lessThanEqual('scheduledAt', now),
                Query.equal('isPushed', false),
                Query.orderAsc('scheduledAt'),
                Query.limit(100)
            ]
        );

        return response;
    } catch (error) {
        console.error('Error fetching scheduled notifications:', error);
        throw error;
    }
};

export const getAppointmentNotifications = async (appointmentId: any) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            [
                Query.equal('appointmentId', appointmentId),
                Query.orderDesc('$createdAt')
            ]
        );

        return response;
    } catch (error) {
        console.error('Error fetching appointment notifications:', error);
        throw error;
    }
};

export const getNotificationsByPriority = async (priority: any, limit = 50) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            [
                Query.equal('priority', priority),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );

        return response;
    } catch (error) {
        console.error('Error fetching notifications by priority:', error);
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId: any) => {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            notificationId,
            {
                isRead: true
            }
        );

        return response;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const markMultipleNotificationsAsRead = async (notificationIds: any) => {
    try {
        //@ts-ignore
        const promises = notificationIds.map(id =>
            databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.notificationsCollectionId,
                id,
                { isRead: true }
            )
        );

        const responses = await Promise.all(promises);
        return responses;
    } catch (error) {
        console.error('Error marking multiple notifications as read:', error);
        throw error;
    }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string) => {
    try {
        const unreadNotifications = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            [
                Query.equal('userId', userId),
                Query.equal('isRead', false),
            ]
        );

        const promises = unreadNotifications.documents.map(notification =>
            databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.notificationsCollectionId,
                notification.$id,
                { isRead: true }
            )
        );

        const responses = await Promise.all(promises);
        return responses;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

// Mark notification as pushed (after sending push notification)
export const markNotificationAsPushed = async (notificationId: string) => {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            notificationId,
            {
                isPushed: true
            }
        );

        return response;
    } catch (error) {
        console.error('Error marking notification as pushed:', error);
        throw error;
    }
};

// Update notification priority
export const updateNotificationPriority = async (notificationId: string, priority: any) => {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            notificationId,
            {
                priority: priority
            }
        );

        return response;
    } catch (error) {
        console.error('Error updating notification priority:', error);
        throw error;
    }
};

// Delete notification
export const deleteNotification = async (notificationId: any) => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            notificationId
        );

        console.log('Notification deleted:', notificationId);
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

export const deleteOldNotifications = async (daysOld = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const oldNotifications = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.notificationsCollectionId,
            [
                Query.lessThan('$createdAt', cutoffDate.toISOString()),
                Query.limit(1000)
            ]
        );

        const deletePromises = oldNotifications.documents.map(notification =>
            databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.notificationsCollectionId,
                notification.$id
            )
        );

        await Promise.all(deletePromises);
        console.log(`Deleted ${oldNotifications.documents.length} old notifications`);
        return oldNotifications.documents.length;
    } catch (error) {
        console.error('Error deleting old notifications:', error);
        throw error;
    }
};