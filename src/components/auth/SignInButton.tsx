"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export function SignInButton({ className }: { className?: string }) {
  const { signIn } = useAuth();

  return (
    <button
      onClick={() => signIn()}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
      }
    >
      Sign in with Google
    </button>
  );
}
