"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { apiPost } from "@/lib/api";
import { TurnstileWidget } from "@/components/turnstile-widget";

const TURNSTILE_ON = !!process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;

type Dict = {
  expertEyebrow: string;
  expertTitle: string;
  expertLead: string;
  expertName: string;
  expertCompany: string;
  expertEmail: string;
  expertMsg: string;
  expertSubmit: string;
  expertNote: string;
  expertSent: string;
};

const INPUT =
  "w-full rounded-[10px] border border-white/20 bg-white/[0.08] px-3.5 py-3 text-sm text-white placeholder:text-white/55 outline-none focus:border-sky-soft";

// "Talk to an expert" card from the Entreprise mockup: a dark gradient panel with an
// inline lead-capture form wired to the request_demo backend (same endpoint as /contact).
export function ExpertForm({ dict }: { dict: Dict }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [hp, setHp] = useState(""); // honeypot — humans never fill this
  const [captcha, setCaptcha] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function submit() {
    if (state === "sending") return;
    if (hp) return setState("sent"); // bot filled the honeypot → silently drop
    if (!email.trim() || !msg.trim()) return; // request_demo requires email + message
    if (TURNSTILE_ON && !captcha) return; // captcha required when configured
    setState("sending");
    const res = await apiPost("request_demo", {
      email: email.trim(),
      name: name.trim(),
      company: company.trim(),
      message: msg.trim(),
      subject: "demo",
      turnstile_token: captcha,
    });
    setState(res.ok ? "sent" : "idle");
  }

  return (
    <div
      id="contact"
      className="relative overflow-hidden rounded-[20px] p-8 text-hero-fg"
      style={{
        background:
          "linear-gradient(150deg, var(--hero-bg), color-mix(in srgb, var(--hero-bg) 80%, var(--accent)))",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_220px_at_90%_0%,rgba(15,158,213,0.22),transparent_70%)]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-soft">
          <MessageSquare size={14} /> {dict.expertEyebrow}
        </span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{dict.expertTitle}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-hero-fg-muted">{dict.expertLead}</p>

        {state === "sent" ? (
          <div className="mt-6 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-6 text-center text-sm font-medium">
            {dict.expertSent}
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={dict.expertName}
                className={INPUT}
                aria-label={dict.expertName}
              />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={dict.expertCompany}
                className={INPUT}
                aria-label={dict.expertCompany}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.expertEmail}
                className={`${INPUT} col-span-2`}
                aria-label={dict.expertEmail}
              />
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={dict.expertMsg}
                rows={3}
                className={`${INPUT} col-span-2 resize-y`}
                aria-label={dict.expertMsg}
              />
              {/* Honeypot — off-screen, off the tab order. */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="pointer-events-none absolute -left-[9999px] h-0 w-0"
              />
            </div>
            <TurnstileWidget onToken={setCaptcha} />
            <button
              type="button"
              onClick={submit}
              disabled={state === "sending"}
              className="mt-4 w-full rounded-full bg-sky-strong px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#08607f] disabled:opacity-60"
            >
              {state === "sending" ? "…" : dict.expertSubmit}
            </button>
            <p className="mt-3 text-center text-xs text-hero-fg-muted">{dict.expertNote}</p>
          </>
        )}
      </div>
    </div>
  );
}
