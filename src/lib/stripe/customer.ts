import "server-only";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";

/** Reuses a User's existing Stripe Customer, or creates and saves one —
 * shared by every route that starts a Checkout Session so a parent never
 * ends up with two Stripe Customer records. */
export async function ensureStripeCustomer(userId: string, email: string, name: string | null) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await getStripe().customers.create({ email, name: name ?? undefined });
  await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}
