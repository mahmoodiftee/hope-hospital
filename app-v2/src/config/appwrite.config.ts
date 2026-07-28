import { Client, Databases, Storage, Account, Avatars } from 'react-native-appwrite';

const client = new Client();

// Must match app.json ios.bundleIdentifier / android.package
const platform = 'com.hope.hospital';

const endpoint =
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId =
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '687534a40002a65f2150';

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export const avatars = new Avatars(client);

// ─── Collection & Database IDs ────────────────────────────────────────────────
// All IDs live here. No ID is hardcoded anywhere else.
export const config = {
    databaseId: '687535c30001472b370a',
    userCollectionId: '6880a6e4003bb8eb1daf',
    doctorsCollectionId: '687cde58003e3a481b07',
    topDoctorsCollectionId: 'topDoctors',
    reviewsCollectionId: '68811f370016887ed420',
    appointmentsCollectionId: '687ceabe0022244f6e7d',
    availableSlotsId: '687e377a00203492fd21',
    timeSlotsCollectionId: 'timeslots',
    notificationsCollectionId: '6885dcb70003c0ad4c75',
    galleryBucketId: '691c5f6e001de2ba402c',
} as const;
