import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { BillingActions } from "@/components/billing/BillingActions";

// The Schedule and Financial Agreement is the only form that produces a
// monthly_tuition_amount (via the RateCard lookup in FormRenderer), so
// tuition billing keys off that specific template.
const TUITION_TEMPLATE_ID = "seed-schedule-agreement";

export default async function BillingPage() {
  const user = await getServerUser();
  if (!user) return null;

  const [applicationFeePayment, tuitionSubmission] = await Promise.all([
    prisma.payment.findFirst({
      where: { userId: user.id, type: "APPLICATION_FEE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.findFirst({
      where: { parentId: user.id, templateId: TUITION_TEMPLATE_ID },
      orderBy: { updatedAt: "desc" },
      include: { payments: { where: { type: "TUITION" }, orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  const monthlyAmount = tuitionSubmission
    ? Number((tuitionSubmission.dataJson as Record<string, unknown>).monthly_tuition_amount) || null
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#f3ede2]">
        Billing
      </h1>
      <BillingActions
        applicationFeeStatus={applicationFeePayment?.status ?? null}
        submissionId={tuitionSubmission?.id ?? null}
        monthlyAmount={monthlyAmount}
        tuitionStatus={tuitionSubmission?.payments[0]?.status ?? null}
        hasBillingAccount={!!user.stripeCustomerId}
      />
    </div>
  );
}
