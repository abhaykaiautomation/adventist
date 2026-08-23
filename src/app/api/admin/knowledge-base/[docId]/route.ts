import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/server";
import { deleteKnowledgeBaseDoc } from "@/lib/rag/knowledgeBase";
import { errorResponse } from "@/lib/api/errors";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    await requireSuperAdmin();
    const { docId } = await params;
    await deleteKnowledgeBaseDoc(docId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
