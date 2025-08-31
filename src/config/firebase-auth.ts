import { initializeAuth } from 'firebase/auth';
import { type Auth } from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from '@/src/config/firebase-config';

// Initialize Firebase Auth for React Native with AsyncStorage persistence
// This ensures auth state persists across app reloads and sessions on native
export const auth: Auth = initializeAuth(firebaseApp, {
  // @ts-expect-error - RN-only API present at runtime per Expo FYI docs
  persistence: FirebaseAuth.getReactNativePersistence(AsyncStorage),
});
