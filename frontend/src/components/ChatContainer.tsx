import { useEffect, useRef } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import type { Message } from "../types/chat";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";
import { LoadingMessage } from "./LoadingMessage";
import { EmptyState } from "./EmptyState";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  showSources: boolean;
  onRegenerate: () => void;
  onRetry: () => void;
  onSuggest: (question: string) => void;
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="animate-fade-in py-4">
      <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent-soft px-4 py-3.5">
        <TriangleAlert
          size={18}
          className="mt-0.5 shrink-0 text-accent"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="whitespace-pre-line text-sm text-foreground">
            {message}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatContainer({
  messages,
  isLoading,
  error,
  showSources,
  onRegenerate,
  onRetry,
  onSuggest,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest content in view.
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    element.scrollTo({
      top: element.scrollHeight,
      behavior: distance > 600 ? "auto" : "smooth",
    });
  }, [messages, isLoading, error]);

  const isEmpty = messages.length === 0 && !isLoading && !error;

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
        {isEmpty ? (
          <EmptyState onSuggest={onSuggest} />
        ) : (
          <div className="divide-y divide-border">
            {messages.map((message, index) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage
                  key={message.id}
                  message={message}
                  showSources={showSources}
                  canRegenerate={
                    !isLoading && index === messages.length - 1
                  }
                  onRegenerate={onRegenerate}
                />
              ),
            )}
            {isLoading && <LoadingMessage />}
            {error && !isLoading && (
              <ErrorBanner message={error} onRetry={onRetry} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
