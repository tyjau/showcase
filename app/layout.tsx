import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkyRH — Modern HR & payroll for teams everywhere",
  description:
    "Run your whole people cycle — payroll, time off, hiring, performance and an employee self-service portal — on one platform, with compliance localized to your country.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={mulish.variable}>
      <body className="font-sans bg-white text-ink antialiased">{children}</body>
    </html>
  );
}
