import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "caff-tracker",
  "appId": process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:381575869719:web:6d97b8e199aa629e477352",
  "storageBucket": process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "caff-tracker.appspot.com",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC8qm8N4up0MVIlsJ5T3pp64NgB8yij2so",
  "authDomain": process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "caff-tracker.firebaseapp.com",
  "messagingSenderId": process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "381575869719",
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  
  // Connect to emulator in development (commented out to use production database)
  // if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  //   // Only connect to emulator on server side in development
  //   try {
  //     connectFirestoreEmulator(db, 'localhost', 8080);
  //   } catch (error) {
  //     // Emulator might not be running, which is fine
  //     console.log('Firebase emulator not running, using production database');
  //   }
  // }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw new Error('Firebase initialization failed');
}

export { db, app }; 