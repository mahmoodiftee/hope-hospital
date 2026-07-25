import { Query } from 'react-native-appwrite';
import { databases, config } from '@/config/appwrite.config';
import { Doctor } from '@/shared/types';

export class DoctorService {
    /**
     * Fetches all doctors or filters them based on search query.
     */
    static async getDoctors(searchQuery?: string): Promise<Doctor[]> {
        try {
            let filters: any[] = [];

            if (searchQuery) {
                filters.push(Query.contains('name', searchQuery));
            }

            // Order by name by default
            filters.push(Query.orderAsc('name'));

            const response = await databases.listDocuments(
                config.databaseId,
                config.doctorsCollectionId,
                filters
            );

            return response.documents.map(doc => ({
                id: doc.$id,
                name: doc.name,
                name_bn: doc.name_bn,
                specialty: doc.specialty,
                specialty_bn: doc.specialty_bn,
                hourlyRate: doc.hourlyRate,
                image: doc.image,
                experience: doc.experience,
                experience_bn: doc.experience_bn,
                specialties: doc.specialties || [],
                specialties_bn: doc.specialties_bn || [],
                reviews: doc.reviews || [],
            })) as Doctor[];
        } catch (error: any) {
            console.error('[DoctorService] getDoctors error:', error);
            throw new Error(error.message || 'Failed to fetch doctors');
        }
    }

    /**
     * Fetches a single doctor by their ID.
     */
    static async getDoctorById(doctorId: string): Promise<Doctor | null> {
        try {
            const response = await databases.getDocument(
                config.databaseId,
                config.doctorsCollectionId,
                doctorId
            );

            // Fetch reviews for this doctor explicitly
            const reviewsRes = await databases.listDocuments(
                config.databaseId,
                config.reviewsCollectionId,
                [Query.equal('doctorId', doctorId)]
            );

            const reviews = reviewsRes.documents.map((doc: any) => ({
                rating: doc.rating,
                review: doc.review,
                review_bn: doc.review_bn,
                patientName: doc.patientName,
                patientName_bn: doc.patientName_bn,
            }));

            return {
                id: response.$id,
                name: response.name,
                name_bn: response.name_bn,
                specialty: response.specialty,
                specialty_bn: response.specialty_bn,
                hourlyRate: response.hourlyRate,
                image: response.image,
                experience: response.experience,
                experience_bn: response.experience_bn,
                specialties: response.specialties || [],
                specialties_bn: response.specialties_bn || [],
                reviews: reviews, // Use explicitly fetched reviews
            } as Doctor;
        } catch (error: any) {
            console.error('[DoctorService] getDoctorById error:', error);
            throw new Error(error.message || 'Failed to fetch doctor details');
        }
    }
}

