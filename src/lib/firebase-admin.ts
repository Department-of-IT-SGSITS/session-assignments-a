import admin from 'firebase-admin';

const firebaseConfig = {
    projectId: "studio-2177517838-2b6e7",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
  });
}

const adminDb = admin.firestore();

export { adminDb };
