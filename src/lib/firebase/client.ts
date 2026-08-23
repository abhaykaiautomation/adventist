"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedAuth: Auth | undefined;

// Lazy on purpose: the Firebase JS SDK validates `apiKey` as soon as
// getAuth() runs, and Next.js evaluates client-component modules during
// static prerendering (e.g. /_not-found) even though effects don't run
// there. Without laziness, a missing/placeholder config breaks `next build`
// entirely instead of only failing when actually used in the browser.
export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cachedAuth = getAuth(app);
  return cachedAuth;
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signOut() {
  return firebaseSignOut(getFirebaseAuth());
}
