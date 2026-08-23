"use client";

import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { FormSchema } from "@/lib/forms/schema";
import { buildZodSchema, sectionsForAudience, hasExternalSigner } from "@/lib/forms/schema";
import { ShareWithPhysician } from "@/components/forms/ShareWithPhysician";
import { FieldQuestionPopover, type FieldQuestionData } from "@/components/forms/FieldQuestionPopover";
import { SignaturePad, type SignaturePadHandle } from "@/components/forms/SignaturePad";
import { ChatWidget } from "@/components/chatbot/ChatWidget";

type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "NEEDS_CHANGES"
  | "AWAITING_EXTERNAL_SIGNER"
  | "APPROVED"
  | "REJECTED"
  | null;

export function FormRenderer({
  templateId,
  schema,
  submissionId: initialSubmissionId,
  initialData,
  status: initialStatus,
  fieldQuestions: initialQuestions,
}: {
  templateId: string;
  schema: FormSchema;
  submissionId: string | null;
  initialData: Record<string, unknown>;
  status: SubmissionStatus;
  fieldQuestions: FieldQuestionData[];
}) {
  const router = useRouter();
  const parentSections = useMemo(() => sectionsForAudience(schema, "PARENT"), [schema]);
  const externalSigner = useMemo(() => hasExternalSigner(schema), [schema]);
  const zodSchema = useMemo(() => buildZodSchema(schema, "PARENT"), [schema]);
  const { register, getValues, handleSubmit, formState } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: initialData,
  });

  const [submissionId, setSubmissionId] = useState(initialSubmissionId);
  const [status, setStatus] = useState(initialStatus);
  const [questions, setQuestions] = useState(initialQuestions);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState("");
  const sigRef = useRef<SignaturePadHandle>(null);

  const readOnly =
    status === "SUBMITTED" ||
    status === "UNDER_REVIEW" ||
    status === "APPROVED" ||
    status === "AWAITING_EXTERNAL_SIGNER";
  const openCount = questions.filter((q) => q.status === "OPEN").length;

  async function refreshQuestions() {
    if (!submissionId) return;
    const res = await fetch(`/api/submissions/${submissionId}/questions`);
    const data = await res.json();
    setQuestions(data.questions ?? []);
  }

  async function saveDraft() {
    setSaving(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/forms/${templateId}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataJson: getValues() }),
      });
      const data = await res.json();
      setSubmissionId(data.submissionId);
      setStatus("DRAFT");
      setBanner("Draft saved.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function attemptSend() {
    if (openCount > 0) {
      setBanner(
        `You have ${openCount} unresolved question(s) — please review the admin's response or withdraw the question before submitting.`
      );
      return;
    }
    handleSubmit(() => setShowSignModal(true))();
  }

  async function confirmSignAndSubmit() {
    if (!signerName.trim() || sigRef.current?.isEmpty()) {
      setBanner("Please type your name and draw your signature.");
      return;
    }
    setSaving(true);
    try {
      // Ensure a submission exists first (Save as Draft may not have run).
      let id = submissionId;
      if (!id) {
        const draftRes = await fetch(`/api/forms/${templateId}/draft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataJson: getValues() }),
        });
        const draftData = await draftRes.json();
        id = draftData.submissionId;
        setSubmissionId(id);
      }

      const consentText =
        "By signing, I confirm the information above is accurate and complete to the best of my knowledge.";

      const res = await fetch(`/api/submissions/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataJson: getValues(),
          signature: {
            signerName: signerName.trim(),
            signatureImg: sigRef.current!.getDataUrl(),
            consentText,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setBanner(err.error ?? "Could not submit — please try again.");
        return;
      }

      setStatus("SUBMITTED");
      setShowSignModal(false);
      setBanner("Form submitted. Thank you!");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ChatWidget formTemplateId={templateId} formName={schema.name} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#f3ede2]">
          {schema.name}
        </h1>
        <div className="flex gap-2 text-sm">
          <a
            href={`/api/forms/${templateId}/pdf`}
            className="rounded border border-[#f3ede2]/20 px-3 py-1.5 text-[#f3ede2] hover:bg-[#f3ede2]/10"
          >
            Blank PDF
          </a>
          {submissionId && (
            <a
              href={`/api/submissions/${submissionId}/pdf`}
              className="rounded border border-[#f3ede2]/20 px-3 py-1.5 text-[#f3ede2] hover:bg-[#f3ede2]/10"
            >
              {status === "SUBMITTED" ? "Submitted PDF" : "Draft PDF"}
            </a>
          )}
        </div>
      </div>

      {banner && (
        <div className="mb-4 rounded-md border border-[#f6c667]/40 bg-[#f6c667]/10 p-3 text-sm text-[#f6c667]">
          {banner}
        </div>
      )}

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {parentSections.map((section) => (
          <fieldset key={section.key} disabled={readOnly} className="space-y-4">
            <legend className="font-[family-name:var(--font-fraunces)] text-lg font-medium text-[#f6c667]">
              {section.label}
            </legend>

            <div
              className={
                section.layout === "grid-2"
                  ? "grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2"
                  : "space-y-4"
              }
            >
            {section.fields.map((field) => {
              const fieldQuestions = questions.filter((q) => q.fieldKey === field.key);
              const error = (formState.errors as Record<string, { message?: string }>)[field.key];

              return (
                <div key={field.key}>
                  {field.type !== "checkbox" && (
                    <label className="flex items-center text-sm font-medium text-[#f3ede2]/90">
                      {field.label}
                      {field.required && <span className="text-[#f6c667]"> *</span>}
                      <FieldQuestionPopover
                        submissionId={submissionId}
                        fieldKey={field.key}
                        questions={fieldQuestions}
                        onChanged={refreshQuestions}
                      />
                    </label>
                  )}

                  <div className="mt-1">
                    {field.type === "select" ? (
                      <select
                        {...register(field.key)}
                        className="w-full rounded-md border border-[#f3ede2]/20 bg-[#241a5e] p-2 text-sm text-[#f3ede2]"
                      >
                        <option value="">Select…</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        {...register(field.key)}
                        rows={3}
                        className="w-full rounded-md border border-[#f3ede2]/20 bg-[#241a5e] p-2 text-sm text-[#f3ede2] placeholder:text-[#f3ede2]/40"
                      />
                    ) : field.type === "checkbox" ? (
                      <label className="flex items-start gap-2 text-sm text-[#f3ede2]">
                        <input type="checkbox" {...register(field.key)} className="mt-1" />
                        <span className="inline-flex flex-wrap items-center">
                          {field.label}
                          {field.required && <span className="text-[#f6c667]"> *</span>}
                          <FieldQuestionPopover
                            submissionId={submissionId}
                            fieldKey={field.key}
                            questions={fieldQuestions}
                            onChanged={refreshQuestions}
                          />
                        </span>
                      </label>
                    ) : (
                      <input
                        type={field.type}
                        {...register(field.key)}
                        className="w-full rounded-md border border-[#f3ede2]/20 bg-[#241a5e] p-2 text-sm text-[#f3ede2] placeholder:text-[#f3ede2]/40"
                      />
                    )}
                  </div>

                  {field.helpText && <p className="mt-1 text-xs text-[#f3ede2]/50">{field.helpText}</p>}
                  {error?.message && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
                </div>
              );
            })}
            </div>
          </fieldset>
        ))}

        {!readOnly && (
          <div className="flex gap-3 border-t border-[#f3ede2]/10 pt-6">
            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="rounded-md border border-[#f3ede2]/20 px-4 py-2 text-sm font-medium text-[#f3ede2] hover:bg-[#f3ede2]/10 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={attemptSend}
              disabled={saving}
              className="rounded-md bg-[#f6c667] px-4 py-2 text-sm font-medium text-[#241a5e] hover:bg-[#f6c667]/90 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        )}
      </form>

      {externalSigner && submissionId && status === "AWAITING_EXTERNAL_SIGNER" && (
        <div className="mt-6">
          <ShareWithPhysician submissionId={submissionId} />
        </div>
      )}

      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-blue-950">Sign &amp; Submit</h2>
            <p className="mt-1 text-xs text-gray-600">
              By signing, I confirm the information above is accurate and complete to the best
              of my knowledge.
            </p>

            <label className="mt-4 block text-sm font-medium text-gray-700">Type your full name</label>
            <input
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="mt-1 w-full rounded-md border p-2 text-sm"
            />

            <label className="mt-4 block text-sm font-medium text-gray-700">Draw your signature</label>
            <div className="mt-1">
              <SignaturePad ref={sigRef} />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowSignModal(false)}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignAndSubmit}
                disabled={saving}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
