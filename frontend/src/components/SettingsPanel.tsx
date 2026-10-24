import { FileText, Moon, Sun, Monitor } from "lucide-react";
import type { ThemePreference } from "../types/chat";
import { Modal } from "./Modal";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  enterToSend: boolean;
  onEnterToSendChange: (value: boolean) => void;
  showSources: boolean;
  onShowSourcesChange: (value: boolean) => void;
}

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "light", label: "Light", icon: <Sun size={15} /> },
  { value: "dark", label: "Dark", icon: <Moon size={15} /> },
  { value: "system", label: "System", icon: <Monitor size={15} /> },
];

const ABOUT_ROWS: [string, string][] = [
  ["Embedding", "all-MiniLM-L6-v2"],
  ["Vector Database", "ChromaDB"],
  ["LLM", "Qwen 2.5 3B"],
  ["Backend", "FastAPI + Ollama"],
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 text-[11px] font-semibold tracking-wide text-muted">
      {children}
    </h3>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span
          className={`w-7 text-right text-xs font-medium ${
            checked ? "text-accent" : "text-muted"
          }`}
          aria-hidden="true"
        >
          {checked ? "ON" : "OFF"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            checked
              ? "border-accent bg-accent"
              : "border-border bg-surface-2"
          }`}
        >
          <span
            className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
              checked ? "translate-x-[22px]" : "translate-x-[2px]"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export function SettingsPanel({
  open,
  onClose,
  theme,
  onThemeChange,
  enterToSend,
  onEnterToSendChange,
  showSources,
  onShowSourcesChange,
}: SettingsPanelProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      maxWidth="max-w-lg"
      closeLabel="Close settings"
    >
      <div className="space-y-6">
        {/* Appearance */}
        <section>
          <SectionTitle>Appearance</SectionTitle>
          <div className="mb-2 text-sm text-foreground">Theme</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {THEME_OPTIONS.map((option) => {
              const checked = theme === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm transition-colors focus-within:outline-2 focus-within:outline-accent ${
                    checked
                      ? "border-accent/50 bg-accent-soft text-foreground"
                      : "border-border text-muted hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={checked}
                    onChange={() => onThemeChange(option.value)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                      checked ? "border-accent" : "border-border"
                    }`}
                    aria-hidden="true"
                  >
                    {checked && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </span>
                  {option.icon}
                  {option.label}
                </label>
              );
            })}
          </div>
        </section>

        {/* Chat */}
        <section>
          <SectionTitle>Chat</SectionTitle>
          <div className="rounded-xl border border-border px-4 py-2.5">
            <Toggle
              checked={enterToSend}
              onChange={onEnterToSendChange}
              label="Enter to send"
            />
            <div className="my-1.5 border-t border-border" />
            <Toggle
              checked={showSources}
              onChange={onShowSourcesChange}
              label="Show sources"
            />
          </div>
        </section>

        {/* About */}
        <section>
          <SectionTitle>About</SectionTitle>
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent">
                <FileText size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Tesla Annual Report AI
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  RAG-powered question answering using the Tesla 2025 Annual
                  Report.
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-border pt-3 sm:grid-cols-2">
              {ABOUT_ROWS.map(([term, value]) => (
                <div key={term} className="flex justify-between gap-3 text-xs">
                  <dt className="text-muted">{term}:</dt>
                  <dd className="font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </Modal>
  );
}
