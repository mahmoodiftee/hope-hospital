/**
 * Update flyer doctor images in Appwrite to the new male/female placeholders.
 *
 * Run:
 *   APPWRITE_API_KEY=... node scripts/update-flyer-doctor-images.js
 */
require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

const FEMALE =
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a663aea0029ec8d2491/view?project=687534a40002a65f2150';
const MALE =
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a663ad80037b48b814c/view?project=687534a40002a65f2150';

const updates = [
  { $id: '6a65e4c700124f8c8151', name: 'Dr. (Lt. Col.) Nasima Rahman', image: FEMALE },
  { $id: '6a65e4c9002aa3a7f188', name: 'Dr. Nrinmoy Biswas', image: MALE },
  { $id: '6a65e4cc002b1d1a52c1', name: 'Dr. Abdul Mannan', image: MALE },
  { $id: '6a65e4ce001d7f1b8bac', name: 'Dr. Farhana Faruq', image: FEMALE },
  { $id: '6a65e4cf0039d8958b08', name: 'Dr. A K M Arif Uddin Ahmed', image: MALE },
];

async function main() {
  const endpoint =
    process.env.APPWRITE_ENDPOINT || process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
  const projectId =
    process.env.APPWRITE_PROJECT_ID || process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId =
    process.env.APPWRITE_DATABASE_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ||
    '687535c30001472b370a';
  const doctorsCollectionId = '687cde58003e3a481b07';

  if (!endpoint || !projectId || !apiKey) {
    console.error('Missing Appwrite credentials');
    process.exit(1);
  }

  const db = new Databases(
    new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  );

  for (const row of updates) {
    try {
      await db.updateDocument(databaseId, doctorsCollectionId, row.$id, {
        image: row.image,
      });
      console.log(`✅ Updated image: ${row.name}`);
    } catch (err) {
      console.error(`❌ Failed: ${row.name}`, err.message || err);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
