import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { retrieveRelevantChunks } from "@/lib/rag/knowledgeBase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `You are the parent-help assistant for Troy Adventist Academy Preschool's \
digital forms portal. Answer ONLY using the "Knowledge base context" provided in each message. \
If the answer is not contained in that context, say you don't have that information and suggest \
the parent contact the school office — never guess, and never fill in or submit form data on the \
parent's behalf.`;

export interface ChatbotAnswer {
  answer: string;
  sources: { id: string; title: string }[];
}

/**
 * RAG entry point (Section 8): retrieve top-k KB chunks via pgvector, pass
 * them as context to Claude, and require the guardrail above so the bot
 * declines rather than guesses when the answer isn't in the knowledge base.
 */
export async function answerChatbotQuestion(
  question: string,
  currentFormName?: string
): Promise<ChatbotAnswer> {
  const chunks = await retrieveRelevantChunks(question, 5);

  const context = chunks.length
    ? chunks.map((c, i) => `[${i + 1}] ${c.title}\n${c.content}`).join("\n\n---\n\n")
    : "(no matching knowledge base content found)";

  const userMessage = [
    currentFormName ? `The parent is currently on the "${currentFormName}" form.` : null,
    `Knowledge base context:\n${context}`,
    `Parent question: ${question}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const answer = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return {
    answer,
    sources: chunks.map((c) => ({ id: c.id, title: c.title })),
  };
}
