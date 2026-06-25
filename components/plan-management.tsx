"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { apiAuthed } from "@/lib/api";
import { type Money } from "@/lib/catalog";
import { stagedTotal, stagedDelta, type Addon } from "@/lib/plan-staging";
import { formatRate } from "@/lib/money";

type Dict = Record<string, string>;
type AddonOpt = { code: string; label: string; prices: Money[] };

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
  const lang = (usePathname() || "").split("/")[1] === "en" ? "en" : "fr";
  const money = (n: number, c: string) => formatRate(n, c, lang);
  const [cur, setCur] = useState({ total: 0, seats: 0, currency: "EUR", plan: "", status: "" });
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

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
  async function save() {
    // Persist for real via the backend. NOTE: the `update_plan_modules` handler is not
    // yet implemented server-side (returns an error today) — so this surfaces a real
    // failure instead of faking success. It starts working the moment the backend ships it.
    setSaveErr(null);
    setSaving(true);
    const res = await apiAuthed("update_plan_modules", { add: Array.from(selected) });
    setSaving(false);
    if (!res.ok) {
      setSaveErr(res.error || dict.planSaveError);
      return;
    }
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
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-sky-text">{dict.planOffer}</p>
            <h3 className="mt-1 text-2xl font-extrabold text-heading">{cur.plan || "—"}</h3>
          </div>
          <div className="text-right">
            <span className="text-[34px] font-extrabold text-heading">{money(newTotal, cur.currency)}</span>
            <span className="text-sm text-muted"> {dict.planPerMonth}</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted">{dict.planSeats}</div>
            <div className="mt-0.5 text-lg font-extrabold text-heading">{cur.seats}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted">{dict.planActiveModules}</div>
            <div className="mt-0.5 text-lg font-extrabold text-heading">{selected.size}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted">{dict.planCostPerSeat}</div>
            <div className="mt-0.5 text-lg font-extrabold text-sky-text">
              {money(cur.seats > 0 ? newTotal / cur.seats : 0, cur.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Module add-ons — stacked rows with pill toggles */}
      {resolvedAddons.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-heading">{dict.planAddTitle}</p>
          <div className="flex flex-col gap-2">
            {resolvedAddons.map((a) => {
              const on = selected.has(a.code);
              return (
                <div
                  key={a.code}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{a.label}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      +{money(a.rate, cur.currency)} {dict.planPerSeat} ·{" "}
                      {money(a.rate * cur.seats, cur.currency)} {dict.planPerMonth}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={a.label}
                    onClick={() => toggle(a.code)}
                    className={`relative h-6 w-11 flex-none rounded-full transition-colors ${on ? "bg-sky-strong" : "bg-line"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {saved && <p className="text-sm font-medium text-ok-fg">{dict.planSaved}</p>}
      {saveErr && (
        <p className="rounded-lg border border-err-border bg-err-bg px-4 py-2.5 text-sm text-err-fg">{saveErr}</p>
      )}

      {/* Persistent unsaved-changes bar */}
      {dirty && (
        <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky bg-tint-sky px-5 py-3">
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
            <button type="button" onClick={save} disabled={saving} className="rounded-full bg-sky-strong px-5 py-2 text-sm font-semibold text-white hover:bg-[#08607f] disabled:opacity-60">
              {saving ? "…" : dict.planSave}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
