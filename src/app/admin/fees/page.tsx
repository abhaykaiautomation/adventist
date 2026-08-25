import { prisma } from "@/lib/prisma";
import { FeeItemActions } from "@/components/admin/FeeItemActions";

export default async function AdminFeesPage() {
  const feeItems = await prisma.feeItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-950">Fee Items</h1>
      <p className="mt-1 text-sm text-gray-600">
        These show up as selectable items in every parent&rsquo;s payment cart. Deactivate a fee
        instead of expecting to delete it — past orders keep their own price snapshot either way.
      </p>

      <div className="mt-4 max-w-lg rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <FeeItemActions />
      </div>

      <ul className="mt-6 space-y-2">
        {feeItems.map((f) => (
          <li key={f.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <FeeItemActions feeItem={f} />
          </li>
        ))}
        {feeItems.length === 0 && (
          <li className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm">
            No fee items yet.
          </li>
        )}
      </ul>
    </div>
  );
}
