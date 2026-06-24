"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { apiRequestDemo } from "@/lib/api";

type Dict = {
  fName: string;
  fEmail: string;
  fCompany: string;
  fSubject: string;
  fMessage: string;
  send: string;
  sending: string;
  errEmail: string;
  errMessage: string;
  errGeneric: string;
  sentTitle: string;
  sentBody: string;
  asideTitle: string;
  subjects: Record<string, string>;
  asidePoints: string[];
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const INPUT =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-sky";

export function ContactForm({ dict }: { dict: Dict }) {
  const subjectKeys = Object.keys(dict.subjects);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState(subjectKeys[0] ?? "demo");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Prefill the subject from ?sujet= (client-only read; no Suspense boundary needed
  // in the static export, mirroring signup-confirm).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const s = sp.get("sujet");
    if (s && subjectKeys.includes(s)) setSubject(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    setError(null);
    if (!EMAIL.test(email.trim())) return setError(dict.errEmail);
    if (message.trim().length === 0) return setError(dict.errMessage);
    setSubmitting(true);
    const res = await apiRequestDemo({
      email: email.trim(),
      message: message.trim(),
      name: name.trim(),
      company: company.trim(),
      subject,
    });
    setSubmitting(false);
    if (!res.ok) return setError(res.error || dict.errGeneric);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-ok-border bg-ok-bg p-8 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface text-ok-fg">
          <Check size={28} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-heading">{dict.sentTitle}</h2>
        <p className="mt-2 text-muted">{dict.sentBody}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">{dict.fName}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">{dict.fEmail}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">{dict.fCompany}</span>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className={INPUT} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">{dict.fSubject}</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={INPUT}>
              {subjectKeys.map((k) => (
                <option key={k} value={k}>
                  {dict.subjects[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">{dict.fMessage}</span>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={INPUT}
          />
        </label>
        {error && (
          <p className="rounded-lg border border-err-border bg-err-bg px-4 py-2.5 text-sm text-err-fg">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded-full bg-sky px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d8bbd] disabled:opacity-50"
        >
          {submitting ? dict.sending : dict.send}
        </button>
      </div>

      <aside className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {dict.asideTitle}
        </h2>
        <ul className="mt-4 space-y-3">
          {dict.asidePoints.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-ink">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint-sky text-sky">
                <Check size={12} strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
