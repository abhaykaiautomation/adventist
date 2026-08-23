import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ user: null });

  const adminRequest =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ? await prisma.adminRequest.findUnique({ where: { userId: user.id } })
      : null;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      adminRequestStatus: adminRequest?.status ?? null,
    },
  });
}
