import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getFormsNav } from "@/lib/nav";
import { errorResponse } from "@/lib/api/errors";

export async function GET() {
  try {
    const user = await requireUser();
    const forms = await getFormsNav(user.id);
    return NextResponse.json({ forms });
  } catch (err) {
    return errorResponse(err);
  }
}
