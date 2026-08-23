import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnswerQuestionForm } from "@/components/admin/AnswerQuestionForm";

export default async function OpenQuestionsPage() {
  const questions = await prisma.fieldQuestion.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "asc" },
    include: {
      submission: { include: { template: true, parent: true } },
      askedBy: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-950">Open Questions</h1>
      <p className="mt-1 text-sm text-gray-600">
        Answer before a parent gets stuck unable to submit — the Send action is blocked
        while any question on their submission is open (Section 2 / 7).
      </p>

      <ul className="mt-6 space-y-3">
        {questions.map((q) => (
          <li key={q.id} className="rounded-md border bg-white p-4">
            <p className="text-xs text-gray-500">
              <Link href={`/admin/submissions/${q.submission.id}`} className="text-blue-700 hover:underline">
                {q.submission.template.name}
              </Link>{" "}
              · {q.submission.parent.email} · field: {q.fieldKey}
            </p>
            <p className="mt-1 text-sm text-gray-800">{q.question}</p>
            <AnswerQuestionForm submissionId={q.submission.id} questionId={q.id} />
          </li>
        ))}
        {questions.length === 0 && (
          <li className="rounded-md border bg-white p-4 text-sm text-gray-500">
            No open questions right now.
          </li>
        )}
      </ul>
    </div>
  );
}
