/**
 * Create Appwrite `topDoctors` collection and seed featured doctors.
 *
 * Schema:
 *   doctorId  (string)  — doctors collection document $id
 *   sortOrder (integer) — lower = first
 *   isActive  (boolean) — hide without deleting
 *
 * Run:
 *   APPWRITE_API_KEY=... node scripts/setup-top-doctors.js
 */
require('dotenv').config();
const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const COLLECTION_ID = 'topDoctors';
const DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID ||
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ||
  '687535c30001472b370a';

/** Featured Hope Hospital doctors (seeded earlier) */
const SEED = [
  { doctorId: '6a65e4c700124f8c8151', sortOrder: 1 }, // Nasima Rahman
  { doctorId: '6a65e4c9002aa3a7f188', sortOrder: 2 }, // Nrinmoy Biswas
  { doctorId: '6a65e4cc002b1d1a52c1', sortOrder: 3 }, // Abdul Mannan
  { doctorId: '6a65e4ce001d7f1b8bac', sortOrder: 4 }, // Farhana Faruq
  { doctorId: '6a65e4cf0039d8958b08', sortOrder: 5 }, // Arif Uddin Ahmed
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const endpoint =
    process.env.APPWRITE_ENDPOINT || process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
  const projectId =
    process.env.APPWRITE_PROJECT_ID || process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    console.error('Missing Appwrite credentials');
    process.exit(1);
  }

  const db = new Databases(
    new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  );

  // 1. Create collection if missing
  try {
    await db.getCollection(DATABASE_ID, COLLECTION_ID);
    console.log(`ℹ️  Collection "${COLLECTION_ID}" already exists`);
  } catch {
    console.log(`Creating collection "${COLLECTION_ID}"...`);
    await db.createCollection({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      name: 'Top Doctors',
      permissions: [Permission.read(Role.any())],
      documentSecurity: false,
    });
    console.log('✅ Collection created');

    // Attributes need a moment after create
    await sleep(1000);

    await db.createStringAttribute({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      key: 'doctorId',
      size: 64,
      required: true,
    });
    await db.createIntegerAttribute({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      key: 'sortOrder',
      required: true,
      min: 0,
      max: 9999,
      default: undefined,
    });
    await db.createBooleanAttribute({
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID,
      key: 'isActive',
      required: true,
      default: true,
    });
    console.log('✅ Attributes created — waiting for them to become available...');
    await sleep(5000);
  }

  // 2. Seed rows (skip if doctorId already present)
  const existing = await db.listDocuments(DATABASE_ID, COLLECTION_ID, []);
  const existingDoctorIds = new Set(existing.documents.map((d) => d.doctorId));

  let created = 0;
  for (const row of SEED) {
    if (existingDoctorIds.has(row.doctorId)) {
      console.log(`⏭️  Skip (exists): ${row.doctorId}`);
      continue;
    }
    try {
      const doc = await db.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        { doctorId: row.doctorId, sortOrder: row.sortOrder, isActive: true }
      );
      console.log(`✅ Seeded sortOrder=${row.sortOrder} → ${row.doctorId} [${doc.$id}]`);
      created++;
    } catch (err) {
      console.error(`❌ Failed seed ${row.doctorId}:`, err.message || err);
    }
  }

  console.log(`\nDone. New rows: ${created}. Collection ID: ${COLLECTION_ID}`);
  console.log('Add to appwrite.config.ts: topDoctorsCollectionId: "topDoctors"');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
