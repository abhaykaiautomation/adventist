import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubmissionActions } from "@/components/admin/SubmissionActions";
import { AnswerQuestionForm } from "@/components/admin/AnswerQuestionForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SubmissionDataView } from "@/components/admin/SubmissionDataView";
import type { FormSchema } from "@/lib/forms/schema";

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      template: true,
      parent: true,
      child: true,
      signatures: true,
      fieldQuestions: { orderBy: { createdAt: "asc" } },
      activity: { orderBy: { createdAt: "desc" }, include: { user: true } },
      shareLinks: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!submission) notFound();

  const schema = submission.template.schemaJson as unknown as FormSchema;
  const data = submission.dataJson as Record<string, unknown>;
  const fieldKeys = schema.sections
    .filter((s) => !s.repeatable)
    .flatMap((s) => s.fields.filter((f) => f.type !== "note").map((f) => f.key));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-blue-950">{submission.template.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            {submission.parent.email} · {submission.child?.fullName ?? "No child selected"}
            <StatusBadge status={submission.status} />
          </p>
        </div>
        <a
          href={`/api/submissions/${submission.id}/pdf`}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Download PDF
        </a>
      </div>

      <SubmissionActions submissionId={submission.id} fieldKeys={fieldKeys} />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Submitted Data</h2>
        <div className="mt-3">
          <SubmissionDataView schema={schema} data={data} />
        </div>
      </div>

      {submission.fieldQuestions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-gray-500">Field Questions &amp; Notes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {submission.fieldQuestions.map((q) => (
              <li key={q.id} className="rounded bg-gray-50 p-2">
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  {q.fieldKey} <StatusBadge status={q.status} />
                </p>
                <p className="mt-1">{q.question}</p>
                {q.answer && <p className="mt-1 text-gray-700">→ {q.answer}</p>}
                {q.status === "OPEN" && (
                  <AnswerQuestionForm submissionId={submission.id} questionId={q.id} />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {submission.payments.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-gray-500">Tuition Billing</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {submission.payments.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                ${(p.amountCents / 100).toFixed(2)}/mo <StatusBadge status={p.status} />
                <span className="text-gray-500">{new Date(p.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submission.signatures.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-gray-500">Signatures</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {submission.signatures.map((s) => (
              <li key={s.id}>
                {s.signerRole}: {s.signerName} — {new Date(s.signedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Activity Timeline</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {submission.activity.map((a) => (
            <li key={a.id} className="flex justify-between border-b pb-1 last:border-0">
              <span>
                {a.action} {a.user ? `— ${a.user.email}` : ""}
              </span>
              <span className="text-gray-500">{new Date(a.createdAt).toLocaleString()}</span>
            </li>
          ))}
          {submission.activity.length === 0 && (
            <li className="text-gray-500">No activity yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
