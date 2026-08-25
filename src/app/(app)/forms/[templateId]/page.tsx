import { notFound } from "next/navigation";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { FormRenderer } from "@/components/forms/FormRenderer";
import type { FormSchema } from "@/lib/forms/schema";

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

  const submission = await prisma.submission.findFirst({
    where: { templateId, parentId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      fieldQuestions: { orderBy: { createdAt: "asc" } },
      payments: { where: { type: "TUITION" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <FormRenderer
      templateId={template.id}
      schema={template.schemaJson as unknown as FormSchema}
      submissionId={submission?.id ?? null}
      initialData={(submission?.dataJson as Record<string, unknown>) ?? {}}
      status={submission?.status ?? null}
      fieldQuestions={submission?.fieldQuestions ?? []}
      tuitionPaymentStatus={submission?.payments[0]?.status ?? null}
    />
  );
}
