"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onIdTokenChanged, type User as FirebaseUser } from "firebase/auth";
import { getFirebaseAuth, signInWithGoogle, signOut as firebaseSignOut } from "@/lib/firebase/client";

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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const VISIT_LOGGED_KEY = "visitLoggedForSession";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAppUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setAppUser(data.user);
  }, []);

  useEffect(() => {
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
    await signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut();
    await fetch("/api/auth/session", { method: "DELETE" });
    sessionStorage.removeItem(VISIT_LOGGED_KEY);
    setAppUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, signIn, signOut, refreshAppUser }}
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
