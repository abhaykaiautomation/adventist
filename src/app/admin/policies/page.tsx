import Link from "next/link";
import { prisma } from "@/lib/prisma";

const CATEGORY_LABELS: Record<string, string> = {
  FORMS: "Forms",
  INFORMATION: "Information",
  POLICIES: "Policies",
  PARENT_CONSENT: "Parent Consent",
};

export default async function AdminPoliciesPage() {
  const policies = await prisma.policyPage.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-950">Policies &amp; Information Pages</h1>
      <p className="mt-1 text-sm text-gray-600">
        Edit the content shown to parents on the enrollment side — e.g. update the lunch menu each
        month. Changes appear immediately, no redeploy needed.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Section</th>
              <th className="p-3">Requires Ack.</th>
              <th className="p-3">Version</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">{p.title}</td>
                <td className="p-3">{CATEGORY_LABELS[p.category] ?? p.category}</td>
                <td className="p-3">{p.requiresAcknowledgment ? "Yes" : "No"}</td>
                <td className="p-3">{p.version}</td>
                <td className="p-3">
                  <Link href={`/admin/policies/${p.id}`} className="text-blue-700 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
