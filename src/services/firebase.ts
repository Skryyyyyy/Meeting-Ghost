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

// Your live Firebase configuration for Meeting Ghost
const metaEnv = (import.meta as any).env || {};
export const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyDBF3Y0gYJ1ms9fHjRDqPAurv49CTbc0d8",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "meeting-ghost-dd6b2.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "meeting-ghost-dd6b2",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "meeting-ghost-dd6b2.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "391705532619",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:391705532619:web:5ae44a440a0863a66e634e",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-F8VY4Z309Z"
};

// Initialize Firebase safely
export function getFirebaseApp() {
  if (getApps().length === 0) {
    try {
      return initializeApp(firebaseConfig);
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
