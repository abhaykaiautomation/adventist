"use client";

import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildZodSchema, type FormSchema, type FormSection } from "@/lib/forms/schema";
import { SignaturePad, type SignaturePadHandle } from "@/components/forms/SignaturePad";

interface ShareData {
  formName: string;
  audience: "PHYSICIAN" | "DENTIST";
  readOnlySections: FormSection[];
  editableSections: FormSection[];
  readOnlyData: Record<string, unknown>;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export default function ShareCompletionPage() {
  const { token } = useParams<{ token: string }>();
  const [email, setEmail] = useState("");
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [signerName, setSignerName] = useState("");
  const sigRef = useRef<SignaturePadHandle>(null);

  const zodSchema = useMemo(() => {
    const editableSchema: FormSchema = data
      ? { name: data.formName, sections: data.editableSections }
      : { name: "", sections: [] };
    return buildZodSchema(editableSchema, data?.audience ?? "PHYSICIAN");
  }, [data]);
  const { register, getValues, handleSubmit, formState } = useForm({ resolver: zodResolver(zodSchema) });

  async function confirmEmail() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not verify access.");
        return;
      }
      setData(json);
    } finally {
      setBusy(false);
    }
  }

  async function submitSection() {
    if (!signerName.trim() || sigRef.current?.isEmpty()) {
      setError("Please type your name and draw your signature.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          dataJson: getValues(),
          signature: {
            signerName: signerName.trim(),
            signatureImg: sigRef.current!.getDataUrl(),
            consentText:
              "By signing, I confirm the information above is accurate and complete to the best of my knowledge.",
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not submit.");
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-xl font-semibold text-blue-950">Thank you</h1>
        <p className="mt-2 text-gray-600">Your section has been submitted. You can close this page.</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="text-xl font-semibold text-blue-950">Confirm your email</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the email this link was sent to. No account or password needed.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-4 w-full rounded-md border p-2 text-sm"
          placeholder="you@example.com"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={confirmEmail}
          disabled={busy || !email.trim()}
          className="mt-4 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Continue
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold text-blue-950">{data.formName}</h1>
      <p className="text-sm text-gray-600">Completing the {data.audience.toLowerCase()} section.</p>

      <section className="mt-6 rounded-md border bg-gray-50 p-4">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Parent-completed (read only)</h2>
        <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.readOnlySections.flatMap((s) =>
            s.fields.map((f) => (
              <div key={f.key}>
                <dt className="text-xs text-gray-500">{f.label}</dt>
                <dd className="text-sm text-gray-800">{formatValue(data.readOnlyData?.[f.key])}</dd>
              </div>
            ))
          )}
        </dl>
      </section>

      <form className="mt-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
        {data.editableSections.map((section) => (
          <fieldset key={section.key} className="space-y-3">
            <legend className="text-lg font-medium text-blue-900">{section.label}</legend>
            {section.fields.map((field) => {
              const err = (formState.errors as Record<string, { message?: string }>)[field.key];
              return (
                <div key={field.key}>
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  <div className="mt-1">
                    {field.type === "select" ? (
                      <select {...register(field.key)} className="w-full rounded-md border p-2 text-sm">
                        <option value="">Select…</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea {...register(field.key)} rows={3} className="w-full rounded-md border p-2 text-sm" />
                    ) : field.type === "checkbox" ? (
                      <input type="checkbox" {...register(field.key)} />
                    ) : (
                      <input type={field.type} {...register(field.key)} className="w-full rounded-md border p-2 text-sm" />
                    )}
                  </div>
                  {err?.message && <p className="mt-1 text-xs text-red-600">{err.message}</p>}
                </div>
              );
            })}
          </fieldset>
        ))}

        <div>
          <label className="text-sm font-medium text-gray-700">Type your full name</label>
          <input
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            className="mt-1 w-full rounded-md border p-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Draw your signature</label>
          <div className="mt-1">
            <SignaturePad ref={sigRef} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={() => handleSubmit(submitSection)()}
          disabled={busy}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Sign &amp; Submit
        </button>
      </form>
    </main>
  );
}
