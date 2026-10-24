import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { askQuestion, isAbortError, normalizeSources } from "../services/api";
import type { Conversation, Message } from "../types/chat";

const CONVERSATIONS_KEY = "tesla-rag-conversations";
const CURRENT_CHAT_KEY = "tesla-rag-current-chat";

const CANCELLED_MESSAGE = "Request cancelled.";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function makeTitle(question: string): string {
  const clean = question.trim().replace(/\s+/g, " ");
  if (clean.length <= 48) return clean || "New chat";
  return `${clean.slice(0, 48).trimEnd()}…`;
}

function isMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Partial<Message>;
  if (
    typeof message.id !== "string" ||
    (message.role !== "user" && message.role !== "assistant") ||
    typeof message.content !== "string"
  ) {
    return false;
  }
  // Re-normalize sources from older saves (legacy page-string arrays are
  // upgraded to structured passages; unusable entries are dropped).
  if (message.sources !== undefined) {
    (message as Message).sources = normalizeSources(message.sources);
  }
  return true;
}

function isConversation(value: unknown): value is Conversation {
  if (typeof value !== "object" || value === null) return false;
  const conversation = value as Partial<Conversation>;
  return (
    typeof conversation.id === "string" &&
    typeof conversation.title === "string" &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every(isMessage)
  );
}

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isConversation);
  } catch {
    return [];
  }
}

function loadCurrentId(): string | null {
  try {
    const raw = localStorage.getItem(CURRENT_CHAT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "string" ? parsed : null;
  } catch {
    return null;
  }
}

interface ChatError {
  convId: string;
  message: string;
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(
    loadConversations,
  );
  const [currentId, setCurrentId] = useState<string | null>(() => {
    const id = loadCurrentId();
    return conversations.some((conversation) => conversation.id === id)
      ? id
      : null;
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<ChatError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Persist history locally (no database for the first version).
  useEffect(() => {
    try {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch {
      // Ignore quota/privacy errors — chat still works in memory.
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(currentId));
    } catch {
      // Ignore storage errors.
    }
  }, [currentId]);

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === currentId) ??
      null,
    [conversations, currentId],
  );

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
    [conversations],
  );

  const messages = activeConversation?.messages ?? EMPTY_MESSAGES;
  const isLoading = loadingId !== null && loadingId === currentId;
  const activeError =
    errorState && errorState.convId === currentId ? errorState.message : null;

  const appendAssistant = useCallback((convId: string, message: Message) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === convId
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
              updatedAt: Date.now(),
            }
          : conversation,
      ),
    );
  }, []);

  const runRequest = useCallback(
    async (convId: string, question: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoadingId(convId);
      setErrorState(null);

      try {
        const result = await askQuestion(question, controller.signal);
        appendAssistant(convId, {
          id: createId(),
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Only surface the failure if this request is still the current one;
        // a newer request may have replaced it.
        if (abortRef.current !== controller) return;
        if (isAbortError(error)) {
          setErrorState({ convId, message: CANCELLED_MESSAGE });
        } else if (error instanceof Error && error.message) {
          setErrorState({ convId, message: error.message });
        } else {
          setErrorState({
            convId,
            message: "Something went wrong. Please try again.",
          });
        }
      } finally {
        setLoadingId((prev) => (prev === convId ? null : prev));
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [appendAssistant],
  );

  /** Send a question: starts a new conversation when needed. */
  const send = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question) return;
      if (currentId && loadingId === currentId) return;

      const userMessage: Message = {
        id: createId(),
        role: "user",
        content: question,
        timestamp: new Date().toISOString(),
      };

      let convId = currentId;
      if (convId && conversations.some((c) => c.id === convId)) {
        const targetId = convId;
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === targetId
              ? {
                  ...conversation,
                  messages: [...conversation.messages, userMessage],
                  updatedAt: Date.now(),
                }
              : conversation,
          ),
        );
      } else {
        convId = createId();
        const now = Date.now();
        const conversation: Conversation = {
          id: convId,
          title: makeTitle(question),
          messages: [userMessage],
          createdAt: now,
          updatedAt: now,
        };
        setConversations((prev) => [conversation, ...prev]);
        setCurrentId(convId);
      }

      void runRequest(convId, question);
    },
    [conversations, currentId, loadingId, runRequest],
  );

  /** Re-ask the last user question, replacing the latest assistant answer. */
  const regenerate = useCallback(() => {
    if (loadingId !== null || !activeConversation) return;
    const { messages: history, id: convId } = activeConversation;

    let lastUserIndex = -1;
    for (let i = history.length - 1; i >= 0; i -= 1) {
      if (history[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const question = history[lastUserIndex].content;
    const kept = history.slice(0, lastUserIndex + 1);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === convId
          ? { ...conversation, messages: kept, updatedAt: Date.now() }
          : conversation,
      ),
    );
    void runRequest(convId, question);
  }, [activeConversation, loadingId, runRequest]);

  /** Retry after an error or cancellation without duplicating the question. */
  const retry = useCallback(() => {
    if (loadingId !== null || !activeConversation) return;
    const history = activeConversation.messages;
    const lastUser = [...history]
      .reverse()
      .find((message) => message.role === "user");
    if (!lastUser) return;
    void runRequest(activeConversation.id, lastUser.content);
  }, [activeConversation, loadingId, runRequest]);

  /** Abort the in-flight request. The backend request may still finish
   *  server-side; we only stop waiting for it. */
  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const newChat = useCallback(() => {
    setCurrentId(null);
    setErrorState(null);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setCurrentId(id);
    setErrorState(null);
  }, []);

  return {
    conversations: sortedConversations,
    currentId,
    activeConversation,
    messages,
    isLoading,
    error: activeError,
    send,
    regenerate,
    retry,
    stop,
    newChat,
    selectConversation,
  };
}

const EMPTY_MESSAGES: Message[] = [];
