import Link from "next/link";
import { getServerUser } from "@/lib/auth/server";
import { getFormsNav, type FormStatusBadge } from "@/lib/nav";

const badgeStyles: Record<FormStatusBadge, string> = {
  NOT_STARTED: "bg-[#f3ede2]/10 text-[#f3ede2]/60",
  DRAFT: "bg-[#f6c667]/20 text-[#f6c667]",
  SUBMITTED: "bg-emerald-400/20 text-emerald-300",
  NEEDS_CHANGES: "bg-red-400/20 text-red-300",
};

const badgeLabels: Record<FormStatusBadge, string> = {
  NOT_STARTED: "Not Started",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CHANGES: "Needs Changes",
};

export default async function FormsListPage() {
  const user = await getServerUser();
  const forms = user ? await getFormsNav(user.id) : [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#f3ede2]">
        Enrollment
      </h1>
      <p className="mt-1 text-sm text-[#f3ede2]/60">
        Every admission and student-related form for your child(ren).
      </p>

      <ul className="mt-6 divide-y divide-[#f3ede2]/10 rounded-md border border-[#f3ede2]/10 bg-[#241a5e]">
        {forms.map((f) => (
          <li key={f.id}>
            <Link
              href={`/forms/${f.id}`}
              className="flex items-center justify-between p-4 hover:bg-[#f3ede2]/5"
            >
              <span className="font-medium text-[#f3ede2]">{f.name}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[f.badge]}`}>
                {badgeLabels[f.badge]}
              </span>
            </Link>
          </li>
        ))}
        {forms.length === 0 && (
          <li className="p-4 text-sm text-[#f3ede2]/50">No forms have been published yet.</li>
        )}
      </ul>
    </div>
  );
}
