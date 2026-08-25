import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getStripe } from "@/lib/stripe/client";
import { errorResponse } from "@/lib/api/errors";

/** Hands the parent off to Stripe's hosted portal to update their card or
 * cancel tuition billing — no need to build that UI ourselves. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account yet" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return errorResponse(err);
  }
}
