import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { CartCheckout } from "@/components/cart/CartCheckout";

// Same template id the in-form tuition button and /billing key off of — the
// Schedule and Financial Agreement is the only form that produces a
// monthly_tuition_amount (via the RateCard lookup in FormRenderer).
const TUITION_TEMPLATE_ID = "seed-schedule-agreement";

export default async function CartPage() {
  const user = await getServerUser();
  if (!user) return null;

  const [feeItems, tuitionSubmission, credits] = await Promise.all([
    prisma.feeItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.submission.findFirst({
      where: { parentId: user.id, templateId: TUITION_TEMPLATE_ID },
      orderBy: { updatedAt: "desc" },
      include: { payments: { where: { type: "TUITION" }, orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    prisma.accountCredit.findMany({ where: { userId: user.id, remainingCents: { gt: 0 } } }),
  ]);

  const monthlyTuitionAmount = tuitionSubmission
    ? Number((tuitionSubmission.dataJson as Record<string, unknown>).monthly_tuition_amount) || null
    : null;
  const tuitionStatus = tuitionSubmission?.payments[0]?.status ?? null;
  const availableCreditCents = credits.reduce((sum, c) => sum + c.remainingCents, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#f3ede2]">
        Pay Fees
      </h1>
      <CartCheckout
        feeItems={feeItems.map((f) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          amountCents: f.amountCents,
          type: f.type,
        }))}
        tuition={
          monthlyTuitionAmount && tuitionStatus !== "PAID"
            ? {
                submissionId: tuitionSubmission!.id,
                monthlyAmountCents: Math.round(monthlyTuitionAmount * 100),
              }
            : null
        }
        availableCreditCents={availableCreditCents}
      />
    </div>
  );
}
