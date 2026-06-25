"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { apiRequestDemo } from "@/lib/api";

type Dict = {
  formTitle: string;
  formNote: string;
  fFirstName: string;
  fLastName: string;
  fEmail: string;
  fCompany: string;
  fSubject: string;
  fMessage: string;
  phFirstName: string;
  phLastName: string;
  phEmail: string;
  phCompany: string;
  phMessage: string;
  send: string;
  sending: string;
  errEmail: string;
  errMessage: string;
  errGeneric: string;
  sentTitle: string;
  sentBody: string;
  resetCta: string;
  subjects: Record<string, string>;
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const LABEL = "flex flex-col gap-1.5 text-[13px] font-bold text-ink";
const INPUT =
  "rounded-[10px] border border-line bg-page px-3.5 py-2.5 text-[14.5px] font-normal text-ink outline-none focus:border-sky";

export function ContactForm({ dict }: { dict: Dict }) {
  const subjectKeys = Object.keys(dict.subjects);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState(subjectKeys[0] ?? "demo");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Prefill subject from ?sujet= and, for a job application, the role from ?poste=
  // (client-only read; no Suspense boundary needed in the static export).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const s = sp.get("sujet");
    if (s && subjectKeys.includes(s)) setSubject(s);
    const poste = sp.get("poste");
    if (poste) setMessage((m) => m || `Candidature : ${poste}\n\n`);
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
      name: `${firstName} ${lastName}`.trim(),
      company: company.trim(),
      subject,
    });
    setSubmitting(false);
    if (!res.ok) return setError(res.error || dict.errGeneric);
    setSent(true);
  }

  function reset() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setCompany("");
    setMessage("");
    setSent(false);
  }

  return (
    <div className="rounded-[20px] border border-line bg-surface p-[26px] sm:p-[30px]">
      {sent ? (
        <div className="flex flex-col items-center px-2 py-8 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ok-bg text-ok-fg">
            <Check size={28} strokeWidth={2.4} />
          </span>
          <h3 className="text-[21px] font-extrabold text-heading">{dict.sentTitle}</h3>
          <p className="mt-2 max-w-[340px] text-[14.5px] text-muted">{dict.sentBody}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-sky hover:text-sky-text"
          >
            {dict.resetCta}
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-[22px] font-extrabold tracking-tight text-heading">{dict.formTitle}</h2>
          <p className="mt-1.5 text-sm text-muted">{dict.formNote}</p>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
            <label className={LABEL}>
              {dict.fFirstName} *
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={dict.phFirstName} className={INPUT} />
            </label>
            <label className={LABEL}>
              {dict.fLastName} *
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={dict.phLastName} className={INPUT} />
            </label>
          </div>
          <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
            <label className={LABEL}>
              {dict.fEmail} *
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={dict.phEmail} className={INPUT} />
            </label>
            <label className={LABEL}>
              {dict.fCompany}
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={dict.phCompany} className={INPUT} />
            </label>
          </div>
          <label className={`${LABEL} mt-3.5`}>
            {dict.fSubject}
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={`${INPUT} cursor-pointer`}>
              {subjectKeys.map((k) => (
                <option key={k} value={k}>
                  {dict.subjects[k]}
                </option>
              ))}
            </select>
          </label>
          <label className={`${LABEL} mt-3.5`}>
            {dict.fMessage} *
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={dict.phMessage}
              className={`${INPUT} resize-y`}
            />
          </label>

          {error && (
            <p className="mt-3.5 rounded-lg border border-err-border bg-err-bg px-4 py-2.5 text-sm text-err-fg">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="mt-5 w-full rounded-full bg-sky-strong py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#08607f] disabled:opacity-50"
          >
            {submitting ? dict.sending : dict.send}
          </button>
        </div>
      )}
    </div>
  );
}
