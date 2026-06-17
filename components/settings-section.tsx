"use client";

import { useEffect, useState } from "react";
import { apiAuthed } from "@/lib/api";

type Dict = Record<string, string>;

// Settings (#5) — reversible account closure. request_account_deletion flags the
// subscription non-renewing (access until term end, NO immediate hard delete); the customer
// can undo. The impact is spelled out before the confirm.
export function SettingsSection({ dict }: { dict: Dict }) {
  const [scheduled, setScheduled] = useState<boolean | null>(null);
  const [accessUntil, setAccessUntil] = useState<string>("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiAuthed("my_consumption").then((res) => {
      const d = res.data || {};
      setScheduled(!!d.cancellation_scheduled);
      setAccessUntil((d.access_until as string) || "");
    });
  }, []);

  async function requestDeletion() {
    setBusy(true);
    const res = await apiAuthed("request_account_deletion", {});
    setBusy(false);
    setConfirming(false);
    if (res.ok) {
      setScheduled(true);
      setAccessUntil((res.data?.access_until as string) || accessUntil);
    }
  }

  async function undo() {
    setBusy(true);
    const res = await apiAuthed("cancel_account_deletion", {});
    setBusy(false);
    if (res.ok) setScheduled(false);
  }

  if (scheduled === null) return <p className="text-muted">{dict.loading}</p>;

  return (
    <div className="rounded-xl border border-[#f0c2b4] bg-[#fdeee9] p-5">
      <h3 className="text-lg font-bold text-navy">{dict.delTitle}</h3>
      {scheduled ? (
        <>
          <p className="mt-2 text-sm text-ink">
            {dict.delScheduled} {accessUntil && <b>{accessUntil}</b>}.
          </p>
          <button
            onClick={undo}
            disabled={busy}
            className="mt-4 rounded-full bg-sky px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? dict.paySaving : dict.delUndo}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">{dict.delImpact}</p>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="mt-4 rounded-full border border-[#b4441f] px-6 py-2.5 text-sm font-semibold text-[#b4441f] hover:bg-[#fbe3da]"
            >
              {dict.delButton}
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={requestDeletion}
                disabled={busy}
                className="rounded-full bg-[#b4441f] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? dict.paySaving : dict.delConfirm}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-muted"
              >
                {dict.payCancel}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
