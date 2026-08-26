"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onIdTokenChanged, type User as FirebaseUser } from "firebase/auth";
import {
  getFirebaseAuth,
  signInWithGoogle,
  signOut as firebaseSignOut,
  completeRedirectSignIn,
} from "@/lib/firebase/client";

export type Role = "PARENT" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "PENDING" | "APPROVED" | "REVOKED";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: UserStatus;
  adminRequestStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
  signInError: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const VISIT_LOGGED_KEY = "visitLoggedForSession";

/** Sign-in used to fail totally silently (no popup, no error, nothing) on
 * any environmental/network hiccup — this turns whatever Firebase threw
 * into something a parent can actually read instead of "nothing happened". */
function describeAuthError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was closed before finishing — please try again.";
    case "auth/unauthorized-domain":
      return "This site isn't authorized for sign-in yet — contact the school office.";
    case "auth/network-request-failed":
      return "Network error during sign-in — check your connection and try again.";
    default:
      return "Sign-in failed — please try again.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState<string | null>(null);

  const refreshAppUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setAppUser(data.user);
  }, []);

  useEffect(() => {
    // Completes a signInWithRedirect flow (used in standalone/installed
    // mode — see lib/firebase/client.ts) after the browser navigates back.
    // Resolves to null harmlessly when there was no pending redirect.
    completeRedirectSignIn().catch((err) => {
      console.error("Redirect sign-in failed", err);
      setSignInError(describeAuthError(err));
    });

    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      // Once per new session, not per navigation/token-refresh (Section 2).
      if (!sessionStorage.getItem(VISIT_LOGGED_KEY)) {
        await fetch("/api/visit", { method: "POST" });
        sessionStorage.setItem(VISIT_LOGGED_KEY, "1");
      }

      await refreshAppUser();
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshAppUser]);

  const signIn = useCallback(async () => {
    setSignInError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in failed", err);
      setSignInError(describeAuthError(err));
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut();
    await fetch("/api/auth/session", { method: "DELETE" });
    sessionStorage.removeItem(VISIT_LOGGED_KEY);
    setAppUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, signIn, signOut, refreshAppUser, signInError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
