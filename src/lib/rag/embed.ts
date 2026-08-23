import "server-only";

const VOYAGE_EMBED_URL = "https://api.voyageai.com/v1/embeddings";
// 1024-dim output — must match the vector(1024) column in schema.prisma.
// If you swap embedding models/providers, update both together and re-embed
// every existing KnowledgeBaseDoc row (dimensions can't be mixed in one column).
const MODEL = "voyage-3";

/**
 * Anthropic doesn't offer its own embeddings endpoint, so retrieval uses
 * Voyage AI (their recommended embeddings partner) while chat completion
 * uses Claude directly (see chat.ts).
 */
export async function embedText(
  text: string,
  inputType: "document" | "query" = "document"
): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set — required for knowledge-base embeddings.");
  }

  const res = await fetch(VOYAGE_EMBED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input: [text], model: MODEL, input_type: inputType }),
  });

  if (!res.ok) {
    throw new Error(`Voyage embeddings request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.data[0].embedding as number[];
}

export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
