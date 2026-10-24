import { useEffect } from "react";
import {
  FileText,
  Info,
  MessageSquare,
  Moon,
  PanelLeftClose,
  Plus,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import type { Conversation } from "../types/chat";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onToggleTheme: () => void;
  resolvedTheme: "light" | "dark";
}

interface Group {
  label: string;
  items: Conversation[];
}

function groupByDay(conversations: Conversation[]): Group[] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  const groups: Group[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const conversation of conversations) {
    const stamp = conversation.updatedAt ?? 0;
    if (stamp >= startOfToday) groups[0].items.push(conversation);
    else if (stamp >= startOfYesterday) groups[1].items.push(conversation);
    else groups[2].items.push(conversation);
  }

  return groups.filter((group) => group.items.length > 0);
}

function SidebarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
    >
      {icon}
      {label}
    </button>
  );
}

export function Sidebar({
  open,
  onClose,
  conversations,
  currentId,
  onSelect,
  onNewChat,
  onOpenSettings,
  onOpenAbout,
  onToggleTheme,
  resolvedTheme,
}: SidebarProps) {
  // Escape closes the overlay (mobile/tablet) sidebar.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        window.matchMedia("(max-width: 1023px)").matches
      ) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const groups = groupByDay(conversations);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-overlay animate-backdrop-in lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-border bg-surface transition-transform duration-300 ease-out lg:static lg:z-auto lg:transition-none ${
          open ? "translate-x-0" : "-translate-x-full lg:hidden"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-accent-soft text-accent">
            <span className="relative flex h-5 w-5 items-center justify-center">
              <FileText size={18} />
              <Sparkles
                size={10}
                className="absolute -right-1.5 -top-1.5 text-accent"
              />
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              Tesla Annual Report AI
            </p>
            <p className="text-[11px] text-muted">2025 Annual Report</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent lg:hidden"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Plus size={16} className="text-accent" />
            New chat
          </button>
        </div>

        {/* Conversation history */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-2"
          aria-label="Conversation history"
        >
          {groups.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted">
              No conversations yet.
              <br />
              Ask a question to get started.
            </p>
          )}
          {groups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-2 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-muted">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((conversation) => {
                  const active = conversation.id === currentId;
                  return (
                    <li key={conversation.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(conversation.id)}
                        aria-current={active ? "true" : undefined}
                        title={conversation.title}
                        className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                          active
                            ? "border-accent/40 bg-accent-soft text-foreground"
                            : "border-transparent text-muted hover:bg-surface-2 hover:text-foreground"
                        }`}
                      >
                        <MessageSquare size={14} className="shrink-0" />
                        <span className="truncate">{conversation.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="space-y-0.5 border-t border-border p-3">
          <SidebarButton
            icon={<Settings size={16} />}
            label="Settings"
            onClick={onOpenSettings}
          />
          <SidebarButton
            icon={
              resolvedTheme === "dark" ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )
            }
            label="Theme"
            onClick={onToggleTheme}
          />
          <SidebarButton
            icon={<Info size={16} />}
            label="About"
            onClick={onOpenAbout}
          />
          <p className="px-2.5 pb-1 pt-2 text-[11px] text-muted">
            Local AI · Qwen 2.5 3B
          </p>
        </div>
      </aside>
    </>
  );
}
