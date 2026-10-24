export type Role = "user" | "assistant";

/**
 * A retrieved PDF passage attached to an assistant message.
 * `page` is the human-readable page number from the backend (null when the
 * loader metadata was missing); `content` is the actual retrieved text.
 */
export interface RetrievedSource {
  page: number | string | null;
  content: string;
  /** Chroma L2 distance — lower means a closer match. */
  relevance_score?: number;
  /** Original PDF filename, when available. */
  source?: string;
  /** Original zero-based page index from the PDF loader (debugging). */
  page_index?: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  sources?: RetrievedSource[];
  timestamp?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AskResponse {
  answer: string;
  rag_answer?: string;
  ai_answer?: string;
  sources: RetrievedSource[];
  insufficient_evidence?: boolean;
}

export type ThemePreference = "light" | "dark" | "system";

export interface ChatSettings {
  theme: ThemePreference;
  enterToSend: boolean;
  showSources: boolean;
}
