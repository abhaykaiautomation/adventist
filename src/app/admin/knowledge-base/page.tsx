import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server";
import { listKnowledgeBaseDocs } from "@/lib/rag/knowledgeBase";
import { KnowledgeBaseManager } from "@/components/admin/KnowledgeBaseManager";

export default async function KnowledgeBasePage() {
  const user = await getServerUser();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/admin");

  const docs = await listKnowledgeBaseDocs();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-950">Chatbot Knowledge Base</h1>
      <p className="mt-1 text-sm text-gray-600">
        Content here is chunked, embedded, and retrieved to ground the parent-facing
        chatbot (Section 8). Each save is one chunk — paste FAQ answers, eligibility
        rules, or instruction text one topic at a time for the cleanest retrieval.
      </p>

      <KnowledgeBaseManager
        initialDocs={docs.map((d) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          updatedAt: d.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
