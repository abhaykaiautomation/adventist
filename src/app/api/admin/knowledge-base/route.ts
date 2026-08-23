import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/server";
import { ingestKnowledgeBaseDoc, listKnowledgeBaseDocs } from "@/lib/rag/knowledgeBase";
import { errorResponse } from "@/lib/api/errors";

export async function GET() {
  try {
    await requireSuperAdmin();
    const docs = await listKnowledgeBaseDocs();
    return NextResponse.json({ docs });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Super-admin uploads FAQ/instruction content; it's chunked + embedded immediately (Section 8). */
export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const { title, content } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    const result = await ingestKnowledgeBaseDoc(title.trim(), content.trim());
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
