import { FilePlus2, Moon, PanelLeft, Sun } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onToggleTheme: () => void;
  resolvedTheme: "light" | "dark";
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
    >
      {children}
    </button>
  );
}

export function Header({
  onToggleSidebar,
  onNewChat,
  onToggleTheme,
  resolvedTheme,
}: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:px-4">
      <IconButton label="Toggle sidebar" onClick={onToggleSidebar}>
        <PanelLeft size={18} />
      </IconButton>

      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-foreground">
          Tesla Annual Report AI
        </p>
        <p className="truncate text-[11px] text-muted">2025 Annual Report</p>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted sm:inline-flex">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          Local AI
        </span>
        <IconButton label="New chat" onClick={onNewChat}>
          <FilePlus2 size={18} />
        </IconButton>
        <IconButton
          label={
            resolvedTheme === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
          onClick={onToggleTheme}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </IconButton>
      </div>
    </header>
  );
}
