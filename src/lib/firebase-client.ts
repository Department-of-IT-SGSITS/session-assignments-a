import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-2177517838-2b6e7",
  appId: "1:712301163747:web:2b5388134a55cf871401d6",
  storageBucket: "studio-2177517838-2b6e7.firebasestorage.app",
  apiKey: "AIzaSyBXgZ_23mvODQ_Ht7Ltfh0fKWynOtcDZ6k",
  authDomain: "studio-2177517838-2b6e7.firebaseapp.com",
  messagingSenderId: "712301163747"
};

// Initialize Firebase for client-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
