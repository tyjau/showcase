import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — partner-overridable CSS vars, theme-independent.
        navy: { DEFAULT: "var(--brand-navy, #0E2841)", deep: "#0a1f33" },
        sky: { DEFAULT: "var(--brand-sky, #0F9ED5)", soft: "#3CAEF2" },

        // Neutrals mapped to semantic tokens → flip automatically under .dark.
        accent: "var(--accent, #156082)",
        ink: "var(--fg, #13212e)",
        muted: "var(--fg-muted, #5a6b7b)",
        line: "var(--hairline, #e2e8ee)",
        mist: "var(--surface-2, #f4f8fb)",

        // Page / surface tokens (use bg-surface, bg-page, border-hairline…).
        page: "var(--bg, #ffffff)",
        header: "var(--header-bg, rgba(255,255,255,0.9))",
        surface: "var(--surface, #ffffff)",
        "surface-2": "var(--surface-2, #f4f8fb)",
        heading: "var(--heading, var(--brand-navy))",

        // Tinted surfaces + status colours.
        "tint-sky": "var(--tint-sky-bg, #e7f4fb)",
        "tint-sky-strong": "var(--tint-sky-strong-bg, #f4fbfe)",
        "ok-bg": "var(--ok-bg, #e6f5ec)",
        "ok-fg": "var(--ok-fg, #2e7d4f)",
        "ok-border": "var(--ok-border, #cdebd8)",
        "warn-bg": "var(--warn-bg, #fdf6e7)",
        "warn-border": "var(--warn-border, #f0d9a8)",
        "warn-fg": "var(--warn-fg, #8a6d1f)",
        "err-bg": "var(--err-bg, #fdeee9)",
        "err-border": "var(--err-border, #f0c2b4)",
        "err-fg": "var(--err-fg, #b4441f)",
        "info-bg": "var(--info-bg, #fff4e0)",
        "info-fg": "var(--info-fg, #a96a00)",

        // Hero band tokens.
        "hero-bg": "var(--hero-bg, var(--brand-navy))",
        "hero-fg": "var(--hero-fg, #ffffff)",
        "hero-fg-muted": "var(--hero-fg-muted, #c7d6e3)",
        "hero-fg-faint": "var(--hero-fg-faint, #9fb4c6)",
      },
      fontFamily: {
        sans: ["var(--font-mulish)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "6xl": "72rem",
      },
    },
  },
  plugins: [],
};
export default config;
