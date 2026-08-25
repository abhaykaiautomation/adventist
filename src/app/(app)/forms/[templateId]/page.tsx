import { notFound } from "next/navigation";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { FormRenderer } from "@/components/forms/FormRenderer";
import { allFields, type FormSchema } from "@/lib/forms/schema";

// Same convention FormRenderer already uses client-side to decide whether a
// form gets the tuition rate lookup — reused here to skip the fee-catalog
// queries below on every other form.
const TUITION_FIELD_KEYS = ["room", "schedule_type", "days_per_week", "monthly_tuition_amount"];

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const user = await getServerUser();
  if (!user) return null; // (app) layout already redirects; satisfies types

  const template = await prisma.formTemplate.findUnique({ where: { id: templateId } });
  if (!template || !template.isActive) notFound();

  const schema = template.schemaJson as unknown as FormSchema;
  const hasTuitionLookup = TUITION_FIELD_KEYS.every((key) => allFields(schema).some((f) => f.key === key));

  const [submission, feeItems, paidCartItems] = await Promise.all([
    prisma.submission.findFirst({
      where: { templateId, parentId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        fieldQuestions: { orderBy: { createdAt: "asc" } },
        payments: { where: { type: "TUITION" }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    hasTuitionLookup
      ? prisma.feeItem.findMany({ where: { isActive: true, type: "ONE_TIME" }, orderBy: { sortOrder: "asc" } })
      : Promise.resolve([]),
    hasTuitionLookup
      ? prisma.cartItem.findMany({
          where: { cartOrder: { userId: user.id, status: "PAID" } },
          select: { feeItemId: true },
        })
      : Promise.resolve([]),
  ]);

  const paidFeeItemIds = paidCartItems.map((c) => c.feeItemId);

  return (
    <FormRenderer
      templateId={template.id}
      schema={schema}
      submissionId={submission?.id ?? null}
      initialData={(submission?.dataJson as Record<string, unknown>) ?? {}}
      status={submission?.status ?? null}
      fieldQuestions={submission?.fieldQuestions ?? []}
      tuitionPaymentStatus={submission?.payments[0]?.status ?? null}
      feeItems={feeItems.map((f) => ({ id: f.id, name: f.name, amountCents: f.amountCents }))}
      paidFeeItemIds={paidFeeItemIds}
    />
  );
}
