import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "var(--brand-navy, #0E2841)", deep: "#0a1f33" },
        sky: { DEFAULT: "var(--brand-sky, #0F9ED5)", soft: "#3CAEF2" },
        accent: "#156082",
        ink: "#13212e",
        muted: "#5a6b7b",
        line: "#e2e8ee",
        mist: "#f4f8fb",
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
