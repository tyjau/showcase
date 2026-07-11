import { Mulish } from "next/font/google";

/**
 * Police du site, partagée par les deux coquilles <html> de l'app (app/[lang]/layout.tsx et
 * app/not-found.tsx). `next/font` veut un appel au niveau module : le centraliser ici évite
 * deux instances divergentes et garde la variable CSS `--font-mulish` unique.
 */
export const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-mulish",
  display: "swap",
});
