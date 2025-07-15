
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// This ensures we only initialize the app once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON!);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
