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

const auth: Auth = getAuth(firebaseApp);

async function signUpWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  // fire and forget email verification (no need to block UI)
  try { await sendEmailVerification(cred.user); } catch {}
  return cred.user;
}

async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

async function signOutUser() {
  await signOut(auth);
}

async function getSignInMethods(email: string) {
  return fetchSignInMethodsForEmail(auth, email.trim());
}

export { auth, onAuthStateChanged, signUpWithEmail, signInWithEmail, signOutUser, getSignInMethods };
export type { User };
