"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "skyrh.theme";

type Labels = {
  toggle: string;
  light: string;
  dark: string;
  system: string;
};

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** Apply the resolved theme by toggling `.dark` on <html>. */
function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

const OPTIONS: { value: Theme; key: keyof Labels; Icon: typeof Sun }[] = [
  { value: "light", key: "light", Icon: Sun },
  { value: "dark", key: "dark", Icon: Moon },
  { value: "system", key: "system", Icon: Monitor },
];

/**
 * Theme switcher (light / dark / system). Persists to localStorage under
 * `skyrh.theme`; the inline boot script in the layout has already applied the
 * stored choice before paint, so this only mirrors state + handles changes.
 *
 * Renders nothing until mounted so the server markup stays theme-neutral (no
 * hydration mismatch — the boot script owns the pre-paint class).
 */
export function ThemeToggle({
  labels,
  className = "",
}: {
  labels: Labels;
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Default to "dark" when nothing is stored — mirrors the layout's dark-by-default
    // boot so the toggle's pressed state matches what the page actually shows.
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || "dark";
    setTheme(stored);
    setMounted(true);
  }, []);

  // When in "system" mode, follow OS changes live.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  function choose(next: Theme) {
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  if (!mounted) {
    // Reserve no surprising space; the control is small. Keep it null pre-mount
    // so SSR and first client paint agree.
    return null;
  }

  return (
    <div
      className={`inline-flex overflow-hidden rounded-md border border-line text-xs ${className}`}
      role="group"
      aria-label={labels.toggle}
    >
      {OPTIONS.map(({ value, key, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => choose(value)}
          aria-pressed={theme === value}
          aria-label={labels[key]}
          title={labels[key]}
          className={`inline-flex h-7 w-7 items-center justify-center transition ${
            theme === value
              ? "bg-navy text-white"
              : "text-muted hover:text-heading"
          }`}
        >
          <Icon size={14} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
