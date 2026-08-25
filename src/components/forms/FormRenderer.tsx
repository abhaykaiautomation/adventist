"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormField, FormSchema, FormSection } from "@/lib/forms/schema";
import { buildZodSchema, sectionsForAudience, hasExternalSigner, groupFieldsByRow, allFields } from "@/lib/forms/schema";
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

/** The open-ended "add another row" list — emergency contacts, release-of-
 * child names, etc. — the digital stand-in for the paper form's "attach
 * additional sheets if more are needed." */
function RepeatableRows({
  section,
  control,
  register,
  readOnly,
}: {
  section: FormSection;
  control: Control;
  register: ReturnType<typeof useForm>["register"];
  readOnly: boolean;
}) {
  const group = section.repeatable!;
  const { fields, append, remove } = useFieldArray({ control, name: section.key });
  const minRows = group.minRows ?? 1;
  const seeded = useRef(false);

  useEffect(() => {
    // Guards against React StrictMode's dev-only double-invoke of effects,
    // which would otherwise append minRows twice before either commit sees
    // the other's rows.
    if (seeded.current) return;
    seeded.current = true;
    if (fields.length === 0) {
      for (let i = 0; i < minRows; i++) {
        append(Object.fromEntries(group.rowFields.map((rf) => [rf.key, ""])));
      }
    }
    // Only ever needs to seed the initial empty rows once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-4 space-y-3">
      {fields.map((row, index) => (
        <div
          key={row.id}
          className="flex flex-wrap items-end gap-3 rounded-md border border-[#f3ede2]/10 p-3"
        >
          <span className="pb-2 text-sm text-[#f3ede2]/50">{index + 1}.</span>
          {group.rowFields.map((rf) => (
            <div key={rf.key} className="min-w-[160px] flex-1">
              <label className="block text-xs text-[#f3ede2]/70">{rf.label}</label>
              <input
                type={rf.type}
                {...register(`${section.key}.${index}.${rf.key}`)}
                className="mt-1 w-full rounded-md border border-[#f3ede2]/20 bg-[#241a5e] p-2 text-sm text-[#f3ede2]"
              />
            </div>
          ))}
          {!readOnly && fields.length > minRows && (
            <button
              type="button"
              onClick={() => remove(index)}
              className="pb-2 text-xs text-[#f3ede2]/50 hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {!readOnly && (!group.maxRows || fields.length < group.maxRows) && (
        <button
          type="button"
          onClick={() => append(Object.fromEntries(group.rowFields.map((rf) => [rf.key, ""])))}
          className="rounded-md border border-[#f6c667]/40 px-3 py-1.5 text-xs font-medium text-[#f6c667] hover:bg-[#f6c667]/10"
        >
          {group.addLabel ?? "+ Add row"}
        </button>
      )}
    </div>
  );
}

function FieldInput({
  field,
  register,
  error,
  submissionId,
  fieldQuestions,
  refreshQuestions,
}: {
  field: FormField;
  register: ReturnType<typeof useForm>["register"];
  error?: { message?: string };
  submissionId: string | null;
  fieldQuestions: FieldQuestionData[];
  refreshQuestions: () => void;
}) {
  if (field.type === "note") {
    return (
      <div>
        {field.label && <p className="text-sm font-medium text-[#f3ede2]/90">{field.label}</p>}
        {field.helpText && (
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[#f3ede2]/80">
            {field.helpText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
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
}

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED" | null;

export function FormRenderer({
  templateId,
  schema,
  submissionId: initialSubmissionId,
  initialData,
  status: initialStatus,
  fieldQuestions: initialQuestions,
  tuitionPaymentStatus: initialTuitionPaymentStatus = null,
}: {
  templateId: string;
  schema: FormSchema;
  submissionId: string | null;
  initialData: Record<string, unknown>;
  status: SubmissionStatus;
  fieldQuestions: FieldQuestionData[];
  tuitionPaymentStatus?: PaymentStatus;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentSections = useMemo(() => sectionsForAudience(schema, "PARENT"), [schema]);
  const externalSigner = useMemo(() => hasExternalSigner(schema), [schema]);
  const zodSchema = useMemo(() => buildZodSchema(schema, "PARENT"), [schema]);
  const { register, control, watch, setValue, getValues, handleSubmit, formState } = useForm({
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
  const [startingTuitionCheckout, setStartingTuitionCheckout] = useState(false);
  const sigRef = useRef<SignaturePadHandle>(null);

  // Live tuition auto-calculation — a field-key convention (any form with a
  // room/schedule_type/days_per_week trio plus a monthly_tuition_amount
  // field gets this), not something tied to one specific templateId.
  const hasTuitionLookup = useMemo(
    () =>
      ["room", "schedule_type", "days_per_week", "monthly_tuition_amount"].every((key) =>
        allFields(schema).some((f) => f.key === key)
      ),
    [schema]
  );
  const watchedRoom = watch("room" as never);
  const watchedScheduleType = watch("schedule_type" as never);
  const watchedDaysPerWeek = watch("days_per_week" as never);
  const [tuitionRateStatus, setTuitionRateStatus] = useState<"idle" | "found" | "not_found">("idle");

  useEffect(() => {
    if (!hasTuitionLookup || !watchedRoom || !watchedScheduleType || !watchedDaysPerWeek) return;
    const daysPerWeek = parseInt(String(watchedDaysPerWeek), 10);
    if (!daysPerWeek) return;

    let cancelled = false;
    const params = new URLSearchParams({
      room: String(watchedRoom),
      scheduleType: String(watchedScheduleType),
      daysPerWeek: String(daysPerWeek),
    });
    fetch(`/api/rate-lookup?${params}`)
      .then((res) => res.json())
      .then((data: { monthlyRate: number | null }) => {
        if (cancelled) return;
        if (data.monthlyRate != null) {
          setValue("monthly_tuition_amount" as never, data.monthlyRate as never, { shouldValidate: true });
          setTuitionRateStatus("found");
        } else {
          setTuitionRateStatus("not_found");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hasTuitionLookup, watchedRoom, watchedScheduleType, watchedDaysPerWeek, setValue]);

  useEffect(() => {
    if (searchParams.get("paid") !== "1") return;
    setBanner("Payment received by Stripe — this updates to Paid below once it's confirmed.");
    router.replace(`/forms/${templateId}`);
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const watchedPaymentMethod = watch("payment_method" as never);
  const showTuitionCheckout = hasTuitionLookup && String(watchedPaymentMethod) === "Pay Online (autopay)";

  /** If the form is still editable, saves whatever's in it right now (even
   * if "Save as Draft" was never clicked) so the Checkout Session's amount
   * matches what the webhook will later mark PAID against. A submitted/
   * approved submission is locked from editing (see EDITABLE_STATUSES in
   * the draft route) — its dataJson is already final, so this skips
   * straight to checkout with the existing submissionId instead of hitting
   * that route's 409. */
  async function payTuitionOnline() {
    setStartingTuitionCheckout(true);
    setBanner(null);
    try {
      let idToCharge = submissionId;

      if (!readOnly) {
        const draftRes = await fetch(`/api/forms/${templateId}/draft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataJson: getValues() }),
        });
        const draftData = await draftRes.json().catch(() => ({}));
        if (!draftRes.ok) {
          setBanner(draftData.error ?? `Couldn't save your form before checkout (HTTP ${draftRes.status}).`);
          return;
        }
        idToCharge = draftData.submissionId;
        setSubmissionId(idToCharge);
        setStatus((prev) => (prev === "DRAFT" || prev === null ? "DRAFT" : prev));
      }

      if (!idToCharge) {
        setBanner("Save this form first, then set up autopay.");
        return;
      }

      const checkoutRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TUITION",
          submissionId: idToCharge,
          returnTo: `/forms/${templateId}`,
        }),
      });
      const checkoutData = await checkoutRes.json().catch(() => ({}));
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        setBanner(checkoutData.error ?? `Couldn't start checkout (HTTP ${checkoutRes.status}).`);
      }
    } catch (err) {
      console.error("payTuitionOnline failed", err);
      setBanner("Something went wrong starting checkout — check the browser console for details.");
    } finally {
      setStartingTuitionCheckout(false);
    }
  }

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
          <div key={section.key} className="space-y-4">
          <fieldset disabled={readOnly} className="space-y-4">
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
            {groupFieldsByRow(section.fields).map((group) =>
              group.length > 1 ? (
                <div key={group.map((f) => f.key).join("+")} className="flex flex-wrap gap-3">
                  {group.map((field) => (
                    <div key={field.key} className="min-w-[140px] flex-1">
                      <FieldInput
                        field={field}
                        register={register}
                        error={(formState.errors as Record<string, { message?: string }>)[field.key]}
                        submissionId={submissionId}
                        fieldQuestions={questions.filter((q) => q.fieldKey === field.key)}
                        refreshQuestions={refreshQuestions}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <FieldInput
                  key={group[0].key}
                  field={group[0]}
                  register={register}
                  error={(formState.errors as Record<string, { message?: string }>)[group[0].key]}
                  submissionId={submissionId}
                  fieldQuestions={questions.filter((q) => q.fieldKey === group[0].key)}
                  refreshQuestions={refreshQuestions}
                />
              )
            )}
            </div>

            {hasTuitionLookup && section.fields.some((f) => f.key === "monthly_tuition_amount") && (
              <p className="text-xs text-[#f3ede2]/60">
                {tuitionRateStatus === "found" &&
                  "Amount filled in automatically from the published rate for your Room, Schedule, and Days selection — the office confirms your final rate at enrollment."}
                {tuitionRateStatus === "not_found" &&
                  "No published rate for that combination (e.g. Activity Time isn't offered in Room 1) — please enter the amount confirmed with the office."}
                {tuitionRateStatus === "idle" &&
                  "Select a Room, Schedule Type, and Days per Week above to fill this in automatically."}
              </p>
            )}

            {section.repeatable && (
              <RepeatableRows
                section={section}
                control={control}
                register={register}
                readOnly={readOnly}
              />
            )}
          </fieldset>

          {/* Outside the fieldset on purpose — a submitted/approved form
              locks its fields, but paying tuition must still work then. */}
          {showTuitionCheckout && section.fields.some((f) => f.key === "monthly_tuition_amount") && (
            <div className="rounded-md border border-[#f6c667]/40 bg-[#f6c667]/10 p-3">
              {initialTuitionPaymentStatus === "PAID" ? (
                <p className="text-sm text-[#f3ede2]">
                  Monthly autopay is set up — thank you!
                </p>
              ) : (
                <>
                  <p className="text-sm text-[#f3ede2]/80">
                    {initialTuitionPaymentStatus === "FAILED"
                      ? "Your last autopay charge failed — set it up again below."
                      : initialTuitionPaymentStatus === "CANCELED"
                        ? "Autopay was canceled — set it up again below."
                        : "Set up monthly autopay for the tuition amount above via Stripe."}
                  </p>
                  <button
                    type="button"
                    onClick={payTuitionOnline}
                    disabled={startingTuitionCheckout}
                    className="mt-2 rounded-md bg-[#f6c667] px-4 py-2 text-sm font-medium text-[#241a5e] hover:bg-[#f6c667]/90 disabled:opacity-50"
                  >
                    {startingTuitionCheckout ? "Redirecting…" : "Pay Online / Set Up Autopay"}
                  </button>
                </>
              )}
            </div>
          )}
          </div>
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
              className="mt-1 w-full rounded-md border bg-white p-2 text-sm text-gray-900"
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
