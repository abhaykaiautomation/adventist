"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

/** Installed/standalone PWA mode (and many in-app browser contexts) breaks
 * window.open-based OAuth popups — they get blocked or lose their connection
 * back to the opener, which looks like sign-in silently doing nothing.
 * Redirect-based sign-in has no such problem, so it's what's used whenever
 * the app is running installed rather than in a normal browser tab. */
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (isStandalone()) {
    return signInWithRedirect(auth, googleProvider);
  }
  return signInWithPopup(auth, googleProvider);
}

/** Completes a signInWithRedirect flow after the browser navigates back —
 * resolves to null (safely) when there was no pending redirect sign-in. */
export async function completeRedirectSignIn() {
  return getRedirectResult(getFirebaseAuth());
}

export async function signOut() {
  return firebaseSignOut(getFirebaseAuth());
}
