import { Sparkles } from "lucide-react";

/**
 * Honest loading state. The backend does not stream tokens,
 * so this shows real request phases instead of fake streaming.
 */
export function LoadingMessage() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in py-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-accent">
          <Sparkles size={14} aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-foreground">
          Tesla Annual Report AI
        </span>
      </div>

      <div className="space-y-1 pl-9 text-sm text-muted">
        <p>Retrieving relevant sections...</p>
        <p>Generating answer...</p>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 pl-9" aria-hidden="true">
        <span
          className="h-2 w-2 rounded-full bg-accent animate-dot"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-accent animate-dot"
          style={{ animationDelay: "160ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-accent animate-dot"
          style={{ animationDelay: "320ms" }}
        />
      </div>

      <span className="sr-only">Working on your answer…</span>
    </div>
  );
}
