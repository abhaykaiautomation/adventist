import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export { SESSION_COOKIE_NAME };

/**
 * Verifies the session cookie and loads (or auto-provisions) the matching
 * Postgres User row. Returns null if there's no valid session — callers
 * decide whether that means "show sign-in" or "403".
 *
 * The Firebase custom claim on the decoded token is a *hint* only; Postgres
 * `role`/`status` remains the source of truth, matching Section 3 of the spec.
 */
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);

    const user = await prisma.user.upsert({
      where: { firebaseUid: decoded.uid },
      update: { email: decoded.email ?? undefined, name: decoded.name ?? undefined },
      create: {
        firebaseUid: decoded.uid,
        email: decoded.email ?? "",
        name: decoded.name ?? null,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getServerUser();
  if (!user) throw new AuthError("Not signed in", 401);
  return user;
}

/** Admin or super-admin, and their AdminRequest must be APPROVED. */
export async function requireApprovedAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new AuthError("Admin access required", 403);
  }
  if (user.status !== "APPROVED") {
    throw new AuthError("Admin access is pending approval", 403);
  }
  return user;
}

export async function requireSuperAdmin(): Promise<User> {
  const user = await requireApprovedAdmin();
  if (user.role !== "SUPER_ADMIN") {
    throw new AuthError("Super-admin access required", 403);
  }
  return user;
}
