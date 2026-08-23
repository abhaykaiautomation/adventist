import Link from "next/link";
import { getServerUser } from "@/lib/auth/server";
import { getPoliciesNav } from "@/lib/nav";

export default async function PoliciesListPage() {
  const user = await getServerUser();
  const policies = user ? await getPoliciesNav(user.id) : [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-blue-950">Policies &amp; Instruction Documents</h1>
      <p className="mt-1 text-sm text-gray-600">
        Reference material from the Parent Handbook. Some require your acknowledgment.
      </p>

      <ul className="mt-6 divide-y rounded-md border bg-white">
        {policies.map((p) => (
          <li key={p.id}>
            <Link href={`/policies/${p.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <span className="font-medium text-gray-800">{p.title}</span>
              {p.requiresAcknowledgment && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    p.acknowledged ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {p.acknowledged ? "Acknowledged" : "Needs Acknowledgment"}
                </span>
              )}
            </Link>
          </li>
        ))}
        {policies.length === 0 && (
          <li className="p-4 text-sm text-gray-500">No policy pages have been published yet.</li>
        )}
      </ul>
    </div>
  );
}
