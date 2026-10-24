import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (question: string) => void;
  onStop: () => void;
  isLoading: boolean;
  enterToSend: boolean;
}

const MAX_HEIGHT = 200;

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  enterToSend,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea with its content.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    const question = value.trim();
    if (!question || isLoading) return;
    onSend(question);
    setValue("");
    // Reset height after clearing.
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) textarea.style.height = "auto";
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    const mod = event.metaKey || event.ctrlKey;
    // Ctrl/Cmd + Enter always sends.
    if (mod) {
      event.preventDefault();
      submit();
      return;
    }
    // Enter sends (when enabled), Shift + Enter inserts a newline.
    if (!event.shiftKey && enterToSend) {
      event.preventDefault();
      submit();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="shrink-0 border-t border-border bg-background px-3 pb-3 pt-3 sm:px-6 sm:pb-4">
      <div className="mx-auto w-full max-w-3xl">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-surface shadow-sm transition-colors focus-within:border-accent/50"
        >
          <label htmlFor="chat-input" className="sr-only">
            Ask a question about Tesla's 2025 Annual Report
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about Tesla's 2025 Annual Report..."
            className="block max-h-[200px] w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[0.95rem] leading-relaxed text-foreground outline-none placeholder:text-muted"
          />
          <div className="flex items-center justify-between gap-3 px-3 pb-2.5 pt-1">
            <span className="hidden select-none text-[11px] text-muted sm:block">
              {enterToSend
                ? "Enter to send · Shift + Enter for a new line"
                : "Ctrl + Enter to send"}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-bubble focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <Square size={13} className="fill-current" />
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label="Send question"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Send
                  <ArrowUp size={15} />
                </button>
              )}
            </div>
          </div>
        </form>
        <p className="mt-2 text-center text-[11px] text-muted">
          Answers come from the Tesla 2025 Annual Report via a local RAG
          pipeline — verify against the filing.
        </p>
      </div>
    </div>
  );
}
