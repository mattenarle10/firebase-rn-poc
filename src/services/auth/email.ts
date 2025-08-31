import { auth } from '@/src/config/firebase-auth';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  type User,
} from 'firebase/auth';

async function signUpWithEmail(email: string, password: string) {
  const norm = email.trim().toLowerCase();
  const cred = await createUserWithEmailAndPassword(auth, norm, password);
  // fire and forget email verification (no need to block UI)
  try { await sendEmailVerification(cred.user); } catch {}
  return cred.user;
}

async function signInWithEmail(email: string, password: string) {
  const norm = email.trim().toLowerCase();
  const cred = await signInWithEmailAndPassword(auth, norm, password);
  return cred.user;
}

async function signOutUser() {
  await signOut(auth);
}

async function getSignInMethods(email: string) {
  const norm = email.trim().toLowerCase();
  return fetchSignInMethodsForEmail(auth, norm);
}

export { auth, onAuthStateChanged, signUpWithEmail, signInWithEmail, signOutUser, getSignInMethods };
export type { User };
