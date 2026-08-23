// Kept in its own file (no server-only / firebase-admin / prisma imports) so
// it can also be imported from middleware.ts, which runs on the Edge runtime.
export const SESSION_COOKIE_NAME = "session";
