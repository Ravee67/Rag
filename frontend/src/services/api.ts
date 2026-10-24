
import type { AskResponse, RetrievedSource } from "../types/chat";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001"
).replace(/\/+$/, "");

const CONNECTION_ERROR =
  "Unable to connect to the AI backend. Make sure FastAPI and Ollama are running.";

const SERVER_ERROR =
  "The AI backend returned an error. Please try again in a moment.";

const BAD_PAYLOAD_ERROR =
  "The AI backend returned an unexpected response. Please try again.";

type RawResponse = {
  answer?: unknown;
  rag_answer?: unknown;
  ai_answer?: unknown;
  sources?: unknown;
  insufficient_evidence?: unknown;
};

function toSource(item: unknown): RetrievedSource | null {
  if (typeof item === "string") {
    const page = item.trim();
    return page ? { page, content: "" } : null;
  }

  if (typeof item !== "object" || item === null) {
    return null;
  }

  const raw = item as Record<string, unknown>;

  const content =
    typeof raw.content === "string" ? raw.content.trim() : "";

  const page =
    typeof raw.page === "number" || typeof raw.page === "string"
      ? raw.page
      : null;

  if (page === null && !content) {
    return null;
  }

  const source: RetrievedSource = { page, content };

  if (
    typeof raw.relevance_score === "number" &&
    Number.isFinite(raw.relevance_score)
  ) {
    source.relevance_score = raw.relevance_score;
  }

  if (typeof raw.source === "string" && raw.source.trim()) {
    source.source = raw.source;
  }

  if (
    typeof raw.page_index === "number" &&
    Number.isFinite(raw.page_index)
  ) {
    source.page_index = raw.page_index;
  }

  return source;
}

export function normalizeSources(raw: unknown): RetrievedSource[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const sources: RetrievedSource[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    const source = toSource(item);

    if (!source) {
      continue;
    }

    const key = `${source.page ?? ""}|${source.content}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    sources.push(source);
  }

  return sources;
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: string }).name === "AbortError"
  );
}

async function readErrorDetail(
  response: Response,
): Promise<string | null> {
  try {
    const body: unknown = await response.json();

    if (typeof body !== "object" || body === null) {
      return null;
    }

    const detail = (body as { detail?: unknown }).detail;

    return typeof detail === "string" && detail.trim()
      ? detail
      : null;
  } catch {
    return null;
  }
}

export async function askQuestion(
  question: string,
  signal?: AbortSignal,
): Promise<AskResponse> {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    throw new Error("Please enter a question.");
  }

  let response: Response;

  // 1. Send the question to FastAPI.
  try {
    response = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        question: trimmedQuestion,
      }),
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new Error(CONNECTION_ERROR);
  }

  // 2. Handle HTTP errors.
  if (!response.ok) {
    const detail = await readErrorDetail(response);
    throw new Error(
      detail ?? `${SERVER_ERROR} (HTTP ${response.status})`,
    );
  }

  // 3. Parse and validate the JSON response.
  let data: RawResponse;

  try {
    const parsed: unknown = await response.json();

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error(BAD_PAYLOAD_ERROR);
    }

    data = parsed as RawResponse;
  } catch (error) {
    if (error instanceof Error && error.message === BAD_PAYLOAD_ERROR) {
      throw error;
    }

    throw new Error(BAD_PAYLOAD_ERROR);
  }

  // 4. Support both the new rag_answer and legacy answer fields.
  const ragAnswer =
    typeof data.rag_answer === "string"
      ? data.rag_answer.trim()
      : typeof data.answer === "string"
        ? data.answer.trim()
        : "";

  if (!ragAnswer) {
    throw new Error(
      "The backend response is missing the RAG answer. Check backend/rag.py.",
    );
  }

  // 5. Require a separate AI-generated explanation.
  const aiAnswer =
    typeof data.ai_answer === "string"
      ? data.ai_answer.trim()
      : "";

  if (!aiAnswer) {
    throw new Error(
      "The backend returned the RAG answer but no AI-generated explanation. Check that backend/rag.py returns both rag_answer and ai_answer.",
    );
  }

  // 6. Return both answers and the retrieved sources.
  // `answer` remains available for existing components that use it.
  return {
    answer: ragAnswer,
    rag_answer: ragAnswer,
    ai_answer: aiAnswer,
    sources: normalizeSources(data.sources),
    insufficient_evidence: data.insufficient_evidence === true,
  };
}
