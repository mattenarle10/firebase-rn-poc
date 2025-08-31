import { firebaseApp } from '@/src/config/firebase-config';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type Auth,
} from 'firebase/auth';

const auth: Auth = getAuth(firebaseApp);

async function signUpWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

async function signOutUser() {
  await signOut(auth);
}

export { auth, onAuthStateChanged, signUpWithEmail, signInWithEmail, signOutUser };
export type { User };