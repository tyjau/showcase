"use client";

import { useEffect, useState } from "react";
import { apiAuthed } from "@/lib/api";
import { usePathname } from "next/navigation";

type Dict = Record<string, string>;

type TicketRow = {
  id: number;
  subject: string;
  status: string;
  updated_at: string;
  message_count: number;
};
type Message = { id: number; author: string; body: string; created_at: string };
type TicketDetail = TicketRow & { messages: Message[] };

function StatusChip({ status }: { status: string }) {
  const cls: Record<string, string> = {
    open: "bg-info-bg text-info-fg",
    pending: "bg-warn-bg text-warn-fg",
    resolved: "bg-ok-bg text-ok-fg",
    closed: "bg-mist text-muted",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls[status] ?? "bg-mist text-muted"}`}>
      {status}
    </span>
  );
}

export function SupportSection({ dict }: { dict: Dict }) {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [active, setActive] = useState<TicketDetail | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  // KB deflection: link to the help center (locale-aware) before a ticket is opened.
  const pathname = usePathname();
  const lang = pathname?.split("/")[1] || "fr";
  const helpHref = `/${lang}/help`;

  function load() {
    apiAuthed("my_support_tickets").then((res) => {
      if (!res.ok) {
        setState("error");
        return;
      }
      setTickets((res.data?.tickets as TicketRow[]) ?? []);
      setState("ready");
    });
  }
  useEffect(() => {
    load();
  }, []);

  async function openTicket(id: number) {
    const res = await apiAuthed("my_support_ticket", { id });
    if (res.ok && res.data) {
      setActive(res.data as TicketDetail);
      setView("detail");
    }
  }

  async function submitNew() {
    if (!subject.trim() || !body.trim()) {
      setFormErr(dict.supFormRequired);
      return;
    }
    setSubmitting(true);
    setFormErr(null);
    const res = await apiAuthed("create_support_ticket", { subject, body });
    setSubmitting(false);
    if (!res.ok || !res.data) {
      setFormErr(dict.supError);
      return;
    }
    setSubject("");
    setBody("");
    setActive(res.data as TicketDetail);
    setView("detail");
    load();
  }

  async function submitReply() {
    if (!active || !reply.trim()) return;
    setReplying(true);
    const res = await apiAuthed("reply_support_ticket", { ticket_id: active.id, body: reply });
    setReplying(false);
    if (res.ok && res.data) {
      setActive(res.data as TicketDetail);
      setReply("");
      load();
    }
  }

  if (state === "loading") return <p className="text-muted">{dict.loading}</p>;
  // Degrades gracefully until the backend release carries the support endpoints.
  if (state === "error")
    return (
      <div className="rounded-xl border border-line bg-mist p-5 text-sm text-muted">
        {dict.supUnavailable}
      </div>
    );

  if (view === "detail" && active) {
    return (
      <div>
        <button
          onClick={() => {
            setView("list");
            setActive(null);
          }}
          className="text-sm font-semibold text-sky hover:underline"
        >
          ← {dict.supBack}
        </button>
        <div className="mt-3 flex items-center gap-3">
          <h2 className="text-lg font-bold text-heading">{active.subject}</h2>
          <StatusChip status={active.status} />
        </div>
        <div className="mt-4 space-y-3">
          {active.messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border border-line p-3 ${m.author === "agent" ? "bg-tint-sky" : "bg-surface"}`}
            >
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {m.author === "agent" ? dict.supAgent : dict.supYou} · {m.created_at}
              </div>
              <p className="whitespace-pre-wrap text-sm text-ink">{m.body}</p>
            </div>
          ))}
        </div>
        {active.status !== "closed" && (
          <div className="mt-4">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder={dict.supReplyPlaceholder}
              className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink"
            />
            <button
              onClick={submitReply}
              disabled={replying || !reply.trim()}
              className="mt-2 rounded-full bg-sky px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {replying ? dict.supSending : dict.supReply}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (view === "new") {
    return (
      <div className="max-w-xl">
        <button onClick={() => setView("list")} className="text-sm font-semibold text-sky hover:underline">
          ← {dict.supBack}
        </button>
        <h2 className="mt-3 text-lg font-bold text-heading">{dict.supNewTitle}</h2>
        <label className="mt-4 block text-sm font-semibold text-ink">{dict.supSubject}</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-surface p-2.5 text-sm text-ink"
        />
        <label className="mt-3 block text-sm font-semibold text-ink">{dict.supMessage}</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-xl border border-line bg-surface p-2.5 text-sm text-ink"
        />
        {formErr && <p className="mt-2 text-sm text-err-fg">{formErr}</p>}
        <button
          onClick={submitNew}
          disabled={submitting}
          className="mt-3 rounded-full bg-sky px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? dict.supSending : dict.supSubmit}
        </button>
      </div>
    );
  }

  return (
    <div>
      <a
        href={helpHref}
        className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-tint-sky px-4 py-3 text-sm text-ink transition hover:bg-mist"
      >
        <span>💡 {dict.supDeflect}</span>
        <span className="ml-auto shrink-0 font-semibold text-sky">{dict.supHelpLink} →</span>
      </a>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{dict.supIntro}</p>
        <button
          onClick={() => {
            setView("new");
            setFormErr(null);
          }}
          className="shrink-0 rounded-full bg-sky px-4 py-2 text-sm font-semibold text-white"
        >
          {dict.supNew}
        </button>
      </div>
      {tickets.length === 0 ? (
        <div className="rounded-xl border border-line bg-mist p-5 text-sm text-muted">{dict.supEmpty}</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => openTicket(t.id)}
              className="flex w-full items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 text-left last:border-0 hover:bg-mist"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{t.subject}</span>
                <span className="text-xs text-muted">
                  {t.updated_at} · {t.message_count} msg
                </span>
              </span>
              <StatusChip status={t.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
