/**
 * Replace `topDoctors` with every doctor currently in the doctors collection.
 *
 * Run from app-v2:
 *   APPWRITE_API_KEY=... node scripts/seed-top-doctors-from-db.js
 */
require('dotenv').config();
const { Client, Databases, ID, Query } = require('node-appwrite');

const DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID ||
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ||
  '687535c30001472b370a';
const DOCTORS_COLLECTION_ID = '687cde58003e3a481b07';
const TOP_DOCTORS_COLLECTION_ID = 'topDoctors';

async function deleteAll(db, collectionId) {
  let deleted = 0;
  while (true) {
    const page = await db.listDocuments(DATABASE_ID, collectionId, [Query.limit(100)]);
    if (page.documents.length === 0) break;
    for (const doc of page.documents) {
      await db.deleteDocument(DATABASE_ID, collectionId, doc.$id);
      deleted++;
    }
    if (page.documents.length < 100) break;
  }
  return deleted;
}

async function main() {
  const endpoint =
    process.env.APPWRITE_ENDPOINT || process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
  const projectId =
    process.env.APPWRITE_PROJECT_ID || process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    console.error('Missing APPWRITE_ENDPOINT / PROJECT_ID / API_KEY');
    process.exit(1);
  }

  const db = new Databases(
    new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  );

  const doctors = await db.listDocuments(DATABASE_ID, DOCTORS_COLLECTION_ID, [
    Query.limit(100),
  ]);

  if (doctors.documents.length === 0) {
    console.error('No doctors found');
    process.exit(1);
  }

  const cleared = await deleteAll(db, TOP_DOCTORS_COLLECTION_ID);
  console.log(`Cleared ${cleared} old topDoctors rows`);

  let created = 0;
  for (let i = 0; i < doctors.documents.length; i++) {
    const doctor = doctors.documents[i];
    await db.createDocument(DATABASE_ID, TOP_DOCTORS_COLLECTION_ID, ID.unique(), {
      doctorId: doctor.$id,
      sortOrder: i + 1,
      isActive: true,
    });
    console.log(`✅ ${i + 1}. ${doctor.name} [${doctor.$id}]`);
    created++;
  }

  console.log(`\nDone. featured=${created}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
