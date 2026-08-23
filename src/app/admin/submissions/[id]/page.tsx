import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubmissionActions } from "@/components/admin/SubmissionActions";
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
    },
  });
  if (!submission) notFound();

  const schema = submission.template.schemaJson as unknown as FormSchema;
  const data = submission.dataJson as Record<string, unknown>;
  const fieldKeys = schema.sections.flatMap((s) => s.fields.map((f) => f.key));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-blue-950">{submission.template.name}</h1>
          <p className="text-sm text-gray-600">
            {submission.parent.email} · {submission.child?.fullName ?? "No child selected"} ·{" "}
            <span className="font-medium">{submission.status.replace("_", " ")}</span>
          </p>
        </div>
        <a
          href={`/api/submissions/${submission.id}/pdf`}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Download PDF
        </a>
      </div>

      <SubmissionActions submissionId={submission.id} fieldKeys={fieldKeys} />

      <div className="rounded-md border bg-white p-4">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Submitted Data</h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {schema.sections.flatMap((section) =>
            section.fields.map((field) => (
              <div key={field.key}>
                <dt className="text-xs text-gray-500">{field.label}</dt>
                <dd className="text-sm text-gray-800">
                  {String(data?.[field.key] ?? "—")}
                </dd>
              </div>
            ))
          )}
        </dl>
      </div>

      {submission.fieldQuestions.length > 0 && (
        <div className="rounded-md border bg-white p-4">
          <h2 className="text-sm font-semibold uppercase text-gray-500">Field Questions &amp; Notes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {submission.fieldQuestions.map((q) => (
              <li key={q.id} className="rounded bg-gray-50 p-2">
                <p className="text-xs text-gray-500">{q.fieldKey} · {q.status}</p>
                <p>{q.question}</p>
                {q.answer && <p className="mt-1 text-gray-700">→ {q.answer}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {submission.signatures.length > 0 && (
        <div className="rounded-md border bg-white p-4">
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

      <div className="rounded-md border bg-white p-4">
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
