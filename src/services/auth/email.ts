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
