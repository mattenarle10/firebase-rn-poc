import { firebaseApp } from '@/src/config/firebase-config';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  type User,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize auth
const auth: Auth = getAuth(firebaseApp);

// Set up persistence manually
// We'll use AsyncStorage to store the user's auth state
const AUTH_STATE_KEY = '@firebase_auth_state';

// Helper function to store auth state in AsyncStorage
async function persistAuthState(user: User | null) {
  if (user) {
    await AsyncStorage.setItem(AUTH_STATE_KEY, JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    }));
  } else {
    await AsyncStorage.removeItem(AUTH_STATE_KEY);
  }
}

// Custom auth state change listener that also persists state to AsyncStorage
function customOnAuthStateChanged(auth: Auth, callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    // Persist auth state to AsyncStorage
    await persistAuthState(user);
    // Call the original callback
    callback(user);
  });
}

async function signUpWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  // fire and forget email verification (no need to block UI)
  try { await sendEmailVerification(cred.user); } catch {}
  // Persist auth state
  await persistAuthState(cred.user);
  return cred.user;
}

async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  // Persist auth state
  await persistAuthState(cred.user);
  return cred.user;
}

async function signOutUser() {
  await signOut(auth);
  // Clear persisted auth state
  await persistAuthState(null);
}

async function getSignInMethods(email: string) {
  return fetchSignInMethodsForEmail(auth, email.trim());
}

// Initialize auth state from AsyncStorage on app start
async function initAuthState() {
  try {
    const storedState = await AsyncStorage.getItem(AUTH_STATE_KEY);
    if (storedState) {
      // We have stored auth state, but we still need to rely on Firebase's auth state
      // This just helps with initial loading state before Firebase auth is ready
      return JSON.parse(storedState);
    }
  } catch (error) {
    console.error('Error loading auth state from AsyncStorage:', error);
  }
  return null;
}

export { auth, customOnAuthStateChanged as onAuthStateChanged, signUpWithEmail, signInWithEmail, signOutUser, getSignInMethods, initAuthState };
export type { User };
