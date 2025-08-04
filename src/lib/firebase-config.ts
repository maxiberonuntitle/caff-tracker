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

// Validate Firebase configuration
const validateFirebaseConfig = (config: any) => {
  const requiredFields = ['projectId', 'appId', 'apiKey', 'authDomain'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration missing required fields:', missingFields);
    return false;
  }
  
  return true;
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

try {
  if (!validateFirebaseConfig(firebaseConfig)) {
    throw new Error('Invalid Firebase configuration');
  }

  console.log('🔧 Initializing Firebase...');
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully');
  
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
  console.error('❌ Failed to initialize Firebase:', error);
  console.error('Error details:', {
    message: error instanceof Error ? error.message : 'Unknown error',
    code: (error as any)?.code,
    stack: error instanceof Error ? error.stack : undefined
  });
  
  // Create a fallback app for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Creating fallback Firebase app for development...');
    try {
      app = initializeApp({
        projectId: 'caff-tracker-dev',
        appId: '1:123456789:web:abcdef',
        storageBucket: 'caff-tracker-dev.appspot.com',
        apiKey: 'dev-api-key',
        authDomain: 'caff-tracker-dev.firebaseapp.com',
        messagingSenderId: '123456789',
      });
      db = getFirestore(app);
      console.log('✅ Fallback Firebase app created');
    } catch (fallbackError) {
      console.error('❌ Failed to create fallback Firebase app:', fallbackError);
      throw new Error('Firebase initialization failed completely');
    }
  } else {
    throw new Error('Firebase initialization failed');
  }
}

export { db, app }; 