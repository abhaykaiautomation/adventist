import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

let cachedApp: App | undefined;

// Lazy on purpose: Next.js imports every route module during build-time page
// data collection (without invoking the handler), so eagerly constructing
// this at module load would crash the build whenever real Firebase
// credentials aren't present yet (e.g. before secrets are configured).
function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  if (getApps().length) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env."
    );
  }

  cachedApp = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return cachedApp;
}

let cachedAuth: Auth | undefined;

export function getAdminAuth(): Auth {
  if (!cachedAuth) cachedAuth = getAuth(getAdminApp());
  return cachedAuth;
}

/**
 * Custom claims are set only on approval (see AdminRequest flow). Callers
 * must still re-verify the claim server-side on every request — never trust
 * a claim read on the client.
 */
export async function setAdminClaim(uid: string, role: "ADMIN" | "SUPER_ADMIN") {
  await getAdminAuth().setCustomUserClaims(uid, { role });
}

export async function clearAdminClaim(uid: string) {
  await getAdminAuth().setCustomUserClaims(uid, { role: null });
}
