import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../types/chat";
import { useCopy } from "../hooks/useCopy";
import { SourceChips } from "./SourceChips";

interface AssistantMessageProps {
  message: Message;
  showSources: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
}

export function AssistantMessage({
  message,
  showSources,
  canRegenerate,
  onRegenerate,
}: AssistantMessageProps) {
  const { copied, failed, copy } = useCopy();
  const sources = message.sources ?? [];

  return (
    <div className="group animate-fade-in py-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-accent">
          <Sparkles size={14} aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-foreground">
          Tesla Annual Report AI
        </span>
      </div>

      <div className="markdown pl-9">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>

      {showSources && sources.length > 0 && (
        <div className="pl-9">
          <SourceChips sources={sources} />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1 pl-9">
        <button
          type="button"
          onClick={() => copy(message.content)}
          aria-label={copied ? "Copied to clipboard" : "Copy answer"}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
        >
          {copied ? (
            <>
              <Check size={13} className="text-accent" aria-hidden="true" />
              Copied ✓
            </>
          ) : failed ? (
            "Couldn't copy"
          ) : (
            <>
              <Copy size={13} aria-hidden="true" />
              Copy
            </>
          )}
        </button>

        {canRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            aria-label="Regenerate answer"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Regenerate
          </button>
        )}
      </div>
    </div>
  );
}
