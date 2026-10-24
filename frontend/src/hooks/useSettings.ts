import { useCallback, useEffect, useState } from "react";
import type { ThemePreference } from "../types/chat";

const THEME_KEY = "tesla-rag-theme";
const SETTINGS_KEY = "tesla-rag-settings";

const THEMES: ThemePreference[] = ["light", "dark", "system"];

function loadTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && THEMES.includes(stored as ThemePreference)) {
      return stored as ThemePreference;
    }
  } catch {
    // Fall through to default.
  }
  return "system";
}

interface StoredChatSettings {
  enterToSend: boolean;
  showSources: boolean;
}

function loadChatSettings(): StoredChatSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredChatSettings>;
      return {
        enterToSend:
          typeof parsed.enterToSend === "boolean" ? parsed.enterToSend : true,
        showSources:
          typeof parsed.showSources === "boolean" ? parsed.showSources : true,
      };
    }
  } catch {
    // Fall through to defaults.
  }
  return { enterToSend: true, showSources: true };
}

/**
 * Theme (light/dark/system) plus chat preferences,
 * persisted in localStorage and applied to <html class="dark">.
 */
export function useSettings() {
  const [theme, setTheme] = useState<ThemePreference>(loadTheme);
  const [enterToSend, setEnterToSend] = useState(
    () => loadChatSettings().enterToSend,
  );
  const [showSources, setShowSources] = useState(
    () => loadChatSettings().showSources,
  );
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  // Track system theme changes for the "system" preference.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Apply the resolved theme to the document.
  useEffect(() => {
    const dark = theme === "dark" || (theme === "system" && systemDark);
    document.documentElement.classList.toggle("dark", dark);
  }, [theme, systemDark]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage errors.
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ enterToSend, showSources }),
      );
    } catch {
      // Ignore storage errors.
    }
  }, [enterToSend, showSources]);

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  /** Quick toggle used in the header/sidebar: flips to the opposite theme. */
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme]);

  return {
    theme,
    setTheme,
    resolvedTheme,
    toggleTheme,
    enterToSend,
    setEnterToSend,
    showSources,
    setShowSources,
  };
}
