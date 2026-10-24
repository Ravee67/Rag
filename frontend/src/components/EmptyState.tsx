import { WelcomeScreen } from "./WelcomeScreen";

interface EmptyStateProps {
  onSuggest: (question: string) => void;
}

/** Rendered inside the scroll area when the current chat has no messages. */
export function EmptyState({ onSuggest }: EmptyStateProps) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <WelcomeScreen onSuggest={onSuggest} />
    </div>
  );
}
