import { ID, Query } from 'react-native-appwrite';
import { databases, config } from '@/config/appwrite.config';
import { DbUser } from '@/shared/types';

export class AuthService {
    /**
     * Checks if a user exists in the database by their phone number.
     */
    static async checkUserExists(phone: string): Promise<{ exists: boolean; user?: DbUser }> {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                config.userCollectionId,
                [Query.equal('phone', phone)]
            );

            if (response.total > 0) {
                return {
                    exists: true,
                    user: response.documents[0] as unknown as DbUser,
                };
            }

            return { exists: false };
        } catch (error: any) {
            console.error('[AuthService] checkUserExists error:', error);
            throw new Error(error.message || 'Failed to check user existence');
        }
    }

    /**
     * Fetches a user document from the database by their phone number.
     */
    static async getUser(phone: string): Promise<DbUser | null> {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                config.userCollectionId,
                [Query.equal('phone', phone)]
            );

            if (response.total > 0) {
                return response.documents[0] as unknown as DbUser;
            }

            return null;
        } catch (error: any) {
            console.error('[AuthService] getUser error:', error);
            throw new Error(error.message || 'Failed to fetch user');
        }
    }

    /**
     * Creates a new user document in the database.
     * Includes a guard to prevent duplicate phone numbers.
     */
    static async createUser(userData: { name: string; age: number; phone: string }): Promise<DbUser> {
        try {
            // Guard: Check if user already exists
            const { exists } = await this.checkUserExists(userData.phone);
            if (exists) {
                throw new Error('A user with this phone number already exists.');
            }

            const response = await databases.createDocument(
                config.databaseId,
                config.userCollectionId,
                ID.unique(),
                userData
            );

            return response as unknown as DbUser;
        } catch (error: any) {
            console.error('[AuthService] createUser error:', error);
            throw new Error(error.message || 'Failed to create user');
        }
    }

    /**
     * Updates a user's profile information in the database.
     */
    static async updateProfile(userId: string, data: { name?: string; age?: number; favorites?: string[] }): Promise<DbUser> {
        try {
            const response = await databases.updateDocument(
                config.databaseId,
                config.userCollectionId,
                userId,
                data
            );

            return response as unknown as DbUser;
        } catch (error: any) {
            console.error('[AuthService] updateProfile error:', error);
            throw new Error(error.message || 'Failed to update profile');
        }
    }

    /**
     * Toggles a doctor ID in the user's favorites list.
     */
    static async toggleFavoriteDoctor(userId: string, doctorId: string, currentFavorites: string[] = []): Promise<DbUser> {
        try {
            let newFavorites = [...currentFavorites];
            const index = newFavorites.indexOf(doctorId);

            if (index > -1) {
                newFavorites.splice(index, 1); // Remove if exists
            } else {
                newFavorites.push(doctorId); // Add if not exists
            }

            return await this.updateProfile(userId, { favorites: newFavorites });
        } catch (error: any) {
            console.error('[AuthService] toggleFavoriteDoctor error:', error);
            throw new Error(error.message || 'Failed to toggle favorite doctor');
        }
    }
}
