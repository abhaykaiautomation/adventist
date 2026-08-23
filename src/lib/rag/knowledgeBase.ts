import "server-only";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { embedText, toVectorLiteral } from "@/lib/rag/embed";

const CHUNK_SIZE = 800;

function chunkText(content: string): string[] {
  const paragraphs = content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > CHUNK_SIZE && current) {
      chunks.push(current);
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [content];
}

/**
 * Chunks + embeds a document into KnowledgeBaseDoc (Section 8). The
 * `embedding` column is `Unsupported("vector")` in Prisma, so writes/reads
 * touching it go through raw SQL — pgvector isn't a type Prisma's client
 * can build queries against natively.
 */
export async function ingestKnowledgeBaseDoc(title: string, content: string): Promise<{ chunks: number }> {
  const chunks = chunkText(content);

  for (const chunk of chunks) {
    const embedding = await embedText(chunk, "document");
    await prisma.$executeRawUnsafe(
      `INSERT INTO "KnowledgeBaseDoc" (id, title, content, embedding, "updatedAt")
       VALUES ($1, $2, $3, $4::vector, now())`,
      randomUUID(),
      title,
      chunk,
      toVectorLiteral(embedding)
    );
  }

  return { chunks: chunks.length };
}

export interface RetrievedChunk {
  id: string;
  title: string;
  content: string;
}

/** Top-k most similar chunks by cosine distance, for the chatbot's context window. */
export async function retrieveRelevantChunks(query: string, k = 5): Promise<RetrievedChunk[]> {
  const embedding = await embedText(query, "query");
  return prisma.$queryRawUnsafe<RetrievedChunk[]>(
    `SELECT id, title, content FROM "KnowledgeBaseDoc" ORDER BY embedding <=> $1::vector LIMIT $2`,
    toVectorLiteral(embedding),
    k
  );
}

interface KnowledgeBaseDocRow {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

// Raw SQL throughout this file (not prisma.knowledgeBaseDoc.*) so it doesn't
// depend on the model being present in the generated client — KnowledgeBaseDoc
// is commented out of schema.prisma until pgvector is installed (see there).
export async function listKnowledgeBaseDocs(): Promise<KnowledgeBaseDocRow[]> {
  return prisma.$queryRawUnsafe<KnowledgeBaseDocRow[]>(
    `SELECT id, title, content, "updatedAt" FROM "KnowledgeBaseDoc" ORDER BY "updatedAt" DESC`
  );
}

export async function deleteKnowledgeBaseDoc(id: string) {
  await prisma.$executeRawUnsafe(`DELETE FROM "KnowledgeBaseDoc" WHERE id = $1`, id);
}
