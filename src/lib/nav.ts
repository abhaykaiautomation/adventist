import "server-only";
import { prisma } from "@/lib/prisma";

export type FormStatusBadge = "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "NEEDS_CHANGES" | "REJECTED";

export type NavCategory = "FORMS" | "INFORMATION" | "POLICIES" | "PARENT_CONSENT";

export interface FormNavItem {
  id: string;
  name: string;
  badge: FormStatusBadge;
  submissionId: string | null;
  category: NavCategory;
}

export interface PolicyNavItem {
  id: string;
  title: string;
  requiresAcknowledgment: boolean;
  acknowledged: boolean;
  category: NavCategory;
}

function badgeFromStatus(
  status: string | undefined
): FormStatusBadge {
  if (!status) return "NOT_STARTED";
  if (status === "DRAFT") return "DRAFT";
  if (status === "NEEDS_CHANGES") return "NEEDS_CHANGES";
  if (status === "REJECTED") return "REJECTED";
  return "SUBMITTED"; // SUBMITTED, UNDER_REVIEW, AWAITING_EXTERNAL_SIGNER, and APPROVED are in the system
}

/** Every active FormTemplate, with this parent's latest submission status. */
export async function getFormsNav(parentId: string): Promise<FormNavItem[]> {
  const templates = await prisma.formTemplate.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      submissions: {
        where: { parentId },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });

  return templates.map((t) => {
    const latest = t.submissions[0];
    return {
      id: t.id,
      name: t.name,
      badge: badgeFromStatus(latest?.status),
      submissionId: latest?.id ?? null,
      category: t.category,
    };
  });
}

/** Every active PolicyPage, with whether this user has acknowledged it. */
export async function getPoliciesNav(userId: string): Promise<PolicyNavItem[]> {
  const policies = await prisma.policyPage.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      acknowledgments: { where: { userId } },
    },
  });

  return policies.map((p) => ({
    id: p.id,
    title: p.title,
    requiresAcknowledgment: p.requiresAcknowledgment,
    acknowledged: p.acknowledgments.length > 0,
    category: p.category,
  }));
}
