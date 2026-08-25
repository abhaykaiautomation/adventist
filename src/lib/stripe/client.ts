import "server-only";
import Stripe from "stripe";

let cached: Stripe | undefined;

/** Lazy on purpose, same reasoning as getFirebaseAuth() — avoids failing
 * `next build` when STRIPE_SECRET_KEY isn't set yet in an environment that
 * never actually calls this. */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  cached = new Stripe(key);
  return cached;
}
