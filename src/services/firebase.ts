import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';

// Standard Firebase Client Config (Can be configured via environment or browser storage)
const metaEnv = (import.meta as any).env || {};
const defaultFirebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForMeetingGhostLocalVault2026',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || 'meeting-ghost.firebaseapp.com',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || 'meeting-ghost',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || 'meeting-ghost.appspot.com',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: metaEnv.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456789',
};

// Initialize Firebase safely with fallback
export function getFirebaseApp() {
  if (getApps().length === 0) {
    try {
      return initializeApp(defaultFirebaseConfig);
    } catch (e) {
      console.warn('Firebase init fallback:', e);
      return null;
    }
  }
  return getApp();
}

export const app = getFirebaseApp();
export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
};
export type { FirebaseUser };
