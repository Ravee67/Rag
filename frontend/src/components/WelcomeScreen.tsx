import { ArrowRight, BatteryCharging, Car, CreditCard, DollarSign, FileText, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onSuggest: (question: string) => void;
}

const SUGGESTIONS: { icon: React.ReactNode; question: string }[] = [
  {
    icon: <DollarSign size={16} className="text-accent" />,
    question: "What was Tesla's total revenue in 2025?",
  },
  {
    icon: <Car size={16} className="text-accent" />,
    question: "How many vehicles did Tesla deliver?",
  },
  {
    icon: <CreditCard size={16} className="text-accent" />,
    question: "What were Tesla's capital expenditures?",
  },
  {
    icon: <BatteryCharging size={16} className="text-accent" />,
    question: "How much energy storage did Tesla deploy?",
  },
];

export function WelcomeScreen({ onSuggest }: WelcomeScreenProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-10 text-center animate-fade-in">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface text-accent shadow-sm">
        <span className="relative flex h-8 w-8 items-center justify-center">
          <FileText size={28} />
          <Sparkles
            size={14}
            className="absolute -right-2.5 -top-2 text-accent"
          />
        </span>
      </span>

      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Tesla Annual Report AI
      </h1>
      <p className="mt-2 text-sm text-muted sm:text-base">
        Ask questions about Tesla's 2025 Annual Report.
      </p>
      <p className="mt-1 text-sm text-muted">
        Get answers using retrieval-augmented generation.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon, question }) => (
          <button
            key={question}
            type="button"
            onClick={() => onSuggest(question)}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-left text-sm text-foreground transition-colors hover:border-accent/40 hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className="flex items-center gap-2.5">
              <span aria-hidden="true">{icon}</span>
              {question}
            </span>
            <ArrowRight
              size={15}
              className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <p className="mt-8 max-w-md text-xs text-muted">
        Answers are generated from the Tesla 2025 Annual Report with
        retrieval-augmented generation. Always verify figures against the filing.
      </p>
    </div>
  );
}
