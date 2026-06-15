import Link from "next/link";
import {
  Check,
  Play,
  Calculator,
  CalendarDays,
  Users,
  UserSearch,
  Target,
  Smartphone,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const features = [
  {
    icon: Calculator,
    title: "Payroll & payslips",
    desc: "Full monthly cycle with country-localized compliance.",
  },
  {
    icon: CalendarDays,
    title: "Time off & attendance",
    desc: "Leave, schedules, holidays and team calendar.",
  },
  {
    icon: Users,
    title: "Employee records",
    desc: "One source of truth for people and contracts.",
  },
  {
    icon: UserSearch,
    title: "Recruitment",
    desc: "From open role to hire, with a talent pool.",
  },
  {
    icon: Target,
    title: "Performance & career",
    desc: "Goals, review campaigns and skills mapping.",
  },
  {
    icon: Smartphone,
    title: "Employee self-service",
    desc: "Payslips, requests and time off, on any device.",
  },
];

const trust = [
  "Payroll & payslips",
  "Time off & attendance",
  "Self-service portal",
  "Localized compliance",
];

const kpis: [string, string][] = [
  ["Employees", "248"],
  ["Net payroll", "$182k"],
  ["Payslips", "248"],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center">
            <span className="text-sm font-semibold tracking-wide text-sky-soft">
              HR &amp; payroll platform
            </span>
            <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
              Modern HR and payroll for teams everywhere
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#c7d6e3]">
              Run your whole people cycle — payroll, time off, hiring,
              performance and an employee self-service portal — on one platform,
              with compliance localized to your country.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-sky px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0d8bbd]"
              >
                Start free trial
              </Link>
              <Link
                href="/company#contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Play size={16} /> Book a demo
              </Link>
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#9fb4c6]">
              <Check size={14} className="text-sky-soft" /> 14-day free trial · no
              credit card
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-xl bg-white p-3.5 text-left text-ink">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Payroll · June 2026</span>
                <span className="rounded-full bg-[#e6f5ec] px-2 py-0.5 text-[11px] text-[#2e7d4f]">
                  Closed
                </span>
              </div>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {kpis.map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-mist p-2">
                    <div className="text-[11px] text-muted">{k}</div>
                    <div className="text-base font-bold text-navy">{v}</div>
                  </div>
                ))}
              </div>
              <div className="flex h-10 items-end gap-1.5">
                {[60, 85, 48, 72, 90, 55].map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: i % 2 ? "#0F9ED5" : "#3CAEF2",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-3 text-xs text-accent">
            {trust.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky text-white">
                  <Check size={11} />
                </span>
                {t}
              </span>
            ))}
          </div>
        </div>

        <section id="product" className="mx-auto max-w-6xl px-5 py-14">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-navy">
              Everything your HR team needs
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted">
              From hire to retire — modular, and connected end to end.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-line p-5 transition hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#e7f4fb] text-sky">
                  <f.icon size={19} />
                </div>
                <h3 className="font-semibold text-ink">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 pb-16">
          <div className="mx-auto max-w-6xl rounded-2xl bg-gradient-to-r from-sky to-accent px-6 py-14 text-center text-white">
            <h2 className="text-2xl font-bold">Ready to modernize your HR?</h2>
            <p className="mx-auto mt-2 max-w-lg text-[#eaf6fd]">
              Start a 14-day free trial — set up your workspace in minutes.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-block rounded-full bg-white px-6 py-3 font-semibold text-accent"
            >
              Start free trial
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
