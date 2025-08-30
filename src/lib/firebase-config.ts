import { FirebaseApp, getApps, initializeApp } from 'firebase/app';

// Minimal Firebase initialization using EXPO_PUBLIC_* env vars
// Simple idea: read config from .env and initialize once.
// You don't need to use anything yet—this just connects the app to your Firebase project.

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  // Optional for web measurement; safe to leave undefined on native
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export { app as firebaseApp };
