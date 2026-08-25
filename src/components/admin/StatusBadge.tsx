const STYLES: Record<string, string> = {
  // Submission statuses
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  NEEDS_CHANGES: "bg-red-100 text-red-800",
  AWAITING_EXTERNAL_SIGNER: "bg-purple-100 text-purple-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  // Field question statuses
  OPEN: "bg-amber-100 text-amber-800",
  ANSWERED: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  WITHDRAWN: "bg-gray-100 text-gray-700",
  // Admin request statuses
  PENDING: "bg-amber-100 text-amber-800",
  // Payment statuses
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELED: "bg-gray-100 text-gray-700",
  // Roles
  SUPER_ADMIN: "bg-purple-100 text-purple-800",
  ADMIN: "bg-blue-100 text-blue-800",
  PARENT: "bg-gray-100 text-gray-700",
  // User statuses
  ACTIVE: "bg-gray-100 text-gray-700",
  REVOKED: "bg-red-100 text-red-800",
};

/** One consistent pill treatment for every status shown across the admin
 * dashboard — submissions, field questions, and admin requests. */
export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
