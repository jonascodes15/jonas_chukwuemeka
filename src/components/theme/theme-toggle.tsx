"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { THEME_STORAGE_KEY } from "./theme-script";

type Theme = "light" | "dark";

function readStored(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// The data-theme attribute on <html> is the single source of truth; React subscribes to it.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

// Unknown on the server; the icon renders after hydration.
function getServerSnapshot(): Theme | null {
  return null;
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Re-apply before paint. In development React's Strict Mode remount clears the attribute
  // the inline script set; in production this is a no-op.
  useLayoutEffect(() => {
    applyTheme(readStored() ?? "dark");
  }, []);

  const toggle = () => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked (private mode): the choice still applies for this page view.
    }
  };

  const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid size-10 place-items-center overflow-hidden rounded-full border border-border text-fg transition-colors hover:border-border-strong hover:bg-surface-2",
        className,
      )}
    >
      {/* Both icons render on the server; CSS picks the right one from data-theme,
          so the correct icon shows on first paint, before hydration. */}
      <Moon
        aria-hidden
        className="absolute size-4.5 translate-y-0 rotate-0 opacity-100 transition-all duration-300 ease-out-expo light:translate-y-4 light:-rotate-45 light:opacity-0"
      />
      <Sun
        aria-hidden
        className="absolute size-4.5 -translate-y-4 rotate-45 opacity-0 transition-all duration-300 ease-out-expo light:translate-y-0 light:rotate-0 light:opacity-100"
      />
    </button>
  );
}
