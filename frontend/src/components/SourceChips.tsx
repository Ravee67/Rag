import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, FileText } from "lucide-react";
import type { RetrievedSource } from "../types/chat";
import { useCopy } from "../hooks/useCopy";

interface SourceChipsProps {
  sources: RetrievedSource[];
}

const COLLAPSE_LENGTH = 240;

function pageText(page: RetrievedSource["page"]): string {
  if (page === null || page === undefined || page === "") return "Unknown";
  return String(page);
}

/**
 * One retrieved passage: page badge + the actual text from the PDF,
 * with an expand/collapse control for long passages and a per-source
 * copy button. The relevance score is only shown when the backend
 * returned one (Chroma L2 distance — lower is a closer match).
 */
function SourceCard({ source }: { source: RetrievedSource }) {
  const [expanded, setExpanded] = useState(false);
  const { copied, failed, copy } = useCopy();

  const content = source.content.trim();
  const isLong = content.length > COLLAPSE_LENGTH;
  const collapsed = isLong && !expanded;
  const hasMeta =
    typeof source.relevance_score === "number" || Boolean(source.source);

  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
          <FileText size={12} aria-hidden="true" />
          Page {pageText(source.page)}
        </span>

        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => copy(content)}
            aria-label={copied ? "Copied passage to clipboard" : "Copy this passage"}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            {copied ? (
              <Check size={13} className="text-accent" aria-hidden="true" />
            ) : (
              <Copy size={13} aria-hidden="true" />
            )}
          </button>

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse passage" : "Expand passage"}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
            >
              {expanded ? (
                <ChevronUp size={14} aria-hidden="true" />
              ) : (
                <ChevronDown size={14} aria-hidden="true" />
              )}
            </button>
          )}
        </span>
      </div>

      {content && (
        <p
          className={`mt-2 text-[13px] leading-relaxed text-foreground/90 ${
            collapsed ? "line-clamp-3" : ""
          }`}
        >
          {content}
        </p>
      )}

      {failed && (
        <p className="mt-1.5 text-[11px] text-muted">Couldn't copy passage</p>
      )}

      {hasMeta && (
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
          {source.source && <span>{source.source}</span>}
          {typeof source.relevance_score === "number" && (
            <span title="Chroma distance — lower is a closer match">
              match distance {source.relevance_score.toFixed(3)} (lower = closer)
            </span>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * "Sources used" section: every source is a distinct retrieved passage
 * with its own page number and content.
 */
export function SourceChips({ sources }: SourceChipsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold tracking-wide text-muted">
        Sources used
      </p>
      <div className="mt-1.5 space-y-2">
        {sources.map((source, index) => (
          <SourceCard
            key={`${source.page}-${source.page_index ?? index}-${index}`}
            source={source}
          />
        ))}
      </div>
    </div>
  );
}
