import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getPoliciesNav } from "@/lib/nav";
import { errorResponse } from "@/lib/api/errors";

export async function GET() {
  try {
    const user = await requireUser();
    const policies = await getPoliciesNav(user.id);
    return NextResponse.json({ policies });
  } catch (err) {
    return errorResponse(err);
  }
}
