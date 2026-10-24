import { Check, Copy } from "lucide-react";
import type { Message } from "../types/chat";
import { useCopy } from "../hooks/useCopy";

export function UserMessage({ message }: { message: Message }) {
  const { copied, failed, copy } = useCopy();

  return (
    <div className="group animate-fade-in py-4">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-muted">
          You
        </span>
        <button
          type="button"
          onClick={() => copy(message.content)}
          aria-label={copied ? "Copied to clipboard" : "Copy message"}
          className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
        >
          {copied ? (
            <>
              <Check size={12} className="text-accent" aria-hidden="true" />
              Copied ✓
            </>
          ) : failed ? (
            "Couldn't copy"
          ) : (
            <>
              <Copy size={12} aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tl-md border border-border bg-bubble px-4 py-3 text-[0.95rem] text-foreground">
        {message.content}
      </div>
    </div>
  );
}
