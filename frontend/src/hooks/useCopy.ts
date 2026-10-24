import { useCallback, useState } from "react";

/**
 * Clipboard copy with a transient "copied" flag.
 * Uses navigator.clipboard.writeText with a graceful failure state.
 */
export function useCopy(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const copy = useCallback(
    (text: string) => {
      const finish = (ok: boolean) => {
        setCopied(ok);
        setFailed(!ok);
        window.setTimeout(() => {
          setCopied(false);
          setFailed(false);
        }, resetMs);
      };

      if (!navigator.clipboard?.writeText) {
        finish(false);
        return;
      }
      navigator.clipboard.writeText(text).then(
        () => finish(true),
        () => finish(false),
      );
    },
    [resetMs],
  );

  return { copied, failed, copy };
}
