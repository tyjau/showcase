"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { apiAuthed } from "@/lib/api";
import { type Money } from "@/lib/catalog";
import { stagedTotal, stagedDelta, type Addon } from "@/lib/plan-staging";

type Dict = Record<string, string>;
type AddonOpt = { code: string; label: string; prices: Money[] };

function money(n: number, cur: string): string {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  if (cur === "XAF") return `${v.toLocaleString("en-US")} XAF`;
  return `${cur === "EUR" ? "€" : "$"}${v.toFixed(2)}`;
}
function rateFor(prices: Money[], cur: string): number {
  const p = prices.find((x) => x.currency === cur && x.cycle === "monthly") ?? prices.find((x) => x.cycle === "monthly");
  return p ? p.amount : 0;
}

const STATES = ["stActive", "stTrial", "stGrace", "stDowngraded"] as const;
const STATUS_TO_STATE: Record<string, (typeof STATES)[number]> = {
  active: "stActive",
  trial: "stTrial",
  grace: "stGrace",
  downgraded: "stDowngraded",
};

// "Offre & abonnement" tab — current offer, account-state chips, and module staging:
// toggling an add-on stages a change (live-recomputed total + a persistent "unsaved
// changes" bar with old→new + delta) until Save/Cancel. Save is a client commit here
// (seam: apiAuthed("update_plan_modules", …) once the backend exposes it).
export function PlanManagement({ dict, addons }: { dict: Dict; addons: AddonOpt[] }) {
  const [cur, setCur] = useState({ total: 0, seats: 0, currency: "EUR", plan: "", status: "" });
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiAuthed("my_consumption").then((res) => {
      if (!res.ok) return setState("error");
      const d = (res.data ?? {}) as Record<string, unknown>;
      const lines = (d.lines as { label?: string }[] | undefined) ?? [];
      setCur({
        total: Number(d.total) || 0,
        seats: Number(d.seats) || 0,
        currency: (d.currency as string) || "EUR",
        plan: lines[0]?.label ?? "",
        status: (d.order_status as string) || "active",
      });
      setState("ready");
    });
  }, []);

  const resolvedAddons: Addon[] = useMemo(
    () => addons.map((a) => ({ code: a.code, label: a.label, rate: rateFor(a.prices, cur.currency) })),
    [addons, cur.currency],
  );

  if (state === "loading") return <p className="text-muted">{dict.loading}</p>;
  if (state === "error") return <p className="text-sm text-err-fg">{dict.payError}</p>;

  const newTotal = stagedTotal(cur.total, resolvedAddons, selected, cur.seats);
  const delta = stagedDelta(cur.total, resolvedAddons, selected, cur.seats);
  const dirty = selected.size > 0;
  const activeState = STATUS_TO_STATE[cur.status] ?? "stActive";

  function toggle(code: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });
    setSaved(false);
  }
  function save() {
    // Seam: persist via apiAuthed("update_plan_modules", { add: [...selected] }) when available.
    setSelected(new Set());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Account-state chips (demo legend) */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{dict.statePreview}</p>
        <div className="flex flex-wrap gap-2">
          {STATES.map((s) => (
            <span
              key={s}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                s === activeState ? "border-sky bg-tint-sky text-sky-text" : "border-line text-muted"
              }`}
            >
              {dict[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Current offer */}
      <div className="rounded-xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{dict.planOffer}</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-bold text-heading">{cur.plan || "—"}</h3>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-heading">{money(newTotal, cur.currency)}</span>
            <span className="text-sm text-muted"> {dict.planPerMonth}</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">
          {cur.seats} {dict.planSeats}
        </p>
      </div>

      {/* Add-on staging */}
      {resolvedAddons.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-heading">{dict.planAddTitle}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {resolvedAddons.map((a) => {
              const on = selected.has(a.code);
              return (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => toggle(a.code)}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition ${
                    on ? "border-sky bg-tint-sky-strong" : "border-line bg-surface hover:border-sky"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 items-center justify-center rounded ${on ? "bg-sky-strong text-white" : "border border-line"}`}>
                      {on && <Check size={13} />}
                    </span>
                    <span className="text-sm font-medium text-ink">{a.label}</span>
                  </span>
                  <span className="text-sm text-muted">+{money(a.rate, cur.currency)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {saved && <p className="text-sm font-medium text-ok-fg">{dict.planSaved}</p>}

      {/* Persistent unsaved-changes bar */}
      {dirty && (
        <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn-border bg-warn-bg px-5 py-3">
          <div className="text-sm">
            <span className="font-semibold text-heading">{dict.planUnsaved}</span>
            <span className="ml-2 text-muted">
              {money(cur.total, cur.currency)} → <span className="font-semibold text-heading">{money(newTotal, cur.currency)}</span>{" "}
              <span className="text-ok-fg">(+{money(delta, cur.currency)})</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelected(new Set())} className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-ink">
              {dict.planCancel}
            </button>
            <button type="button" onClick={save} className="rounded-full bg-sky-strong px-5 py-2 text-sm font-semibold text-white hover:bg-[#08607f]">
              {dict.planSave}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
