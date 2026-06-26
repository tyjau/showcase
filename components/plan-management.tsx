"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Clock, AlertTriangle, ArrowDown } from "lucide-react";
import { apiAuthed } from "@/lib/api";
import { type Money } from "@/lib/catalog";
import { addedRate, type Addon } from "@/lib/plan-staging";
import { formatRate } from "@/lib/money";

type Dict = Record<string, string>;
type AddonOpt = { code: string; label: string; prices: Money[] };
type Life = "active" | "trial" | "grace" | "downgraded";

function rateFor(prices: Money[], cur: string): number {
  const p = prices.find((x) => x.currency === cur && x.cycle === "monthly") ?? prices.find((x) => x.cycle === "monthly");
  return p ? p.amount : 0;
}

const STATES: { key: Life; dict: string }[] = [
  { key: "active", dict: "stActive" },
  { key: "trial", dict: "stTrial" },
  { key: "grace", dict: "stGrace" },
  { key: "downgraded", dict: "stDowngraded" },
];
const STATUS_TO_LIFE: Record<string, Life> = {
  active: "active",
  trial: "trial",
  grace: "grace",
  downgraded: "downgraded",
};

// "Offre & abonnement" tab — current offer, account-state preview banners, seat steppers
// and module staging. Toggling an add-on or changing the seat count stages a change
// (live-recomputed total + a persistent "unsaved changes" bar with old→new + delta) until
// Save/Cancel. Save commits via apiAuthed("update_plan_modules", …).
export function PlanManagement({ dict, addons }: { dict: Dict; addons: AddonOpt[] }) {
  const lang = (usePathname() || "").split("/")[1] === "en" ? "en" : "fr";
  const money = (n: number, c: string) => formatRate(n, c, lang);
  const [cur, setCur] = useState({ total: 0, seats: 0, currency: "EUR", plan: "", status: "active", activeModules: 0, periodEnd: "" });
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [seats, setSeats] = useState(0); // draft seat count (steppers)
  const [life, setLife] = useState<Life>("active"); // demo lifecycle preview
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    apiAuthed("my_consumption").then((res) => {
      if (!res.ok) return setState("error");
      const d = (res.data ?? {}) as Record<string, unknown>;
      const lines = (d.lines as { label?: string }[] | undefined) ?? [];
      const seatCount = Number(d.seats) || 0;
      setCur({
        total: Number(d.total) || 0,
        seats: seatCount,
        currency: (d.currency as string) || "EUR",
        plan: (d.plan as string) || (lines[0]?.label ?? "").split("·")[0].trim(),
        status: (d.order_status as string) || "active",
        activeModules: Number(d.active_modules) || 0,
        periodEnd: (d.period_end as string) || "",
      });
      setSeats(seatCount);
      setLife(STATUS_TO_LIFE[(d.order_status as string) || "active"] ?? "active");
      setState("ready");
    });
  }, []);

  const resolvedAddons: Addon[] = useMemo(
    () => addons.map((a) => ({ code: a.code, label: a.label, rate: rateFor(a.prices, cur.currency) })),
    [addons, cur.currency],
  );

  if (state === "loading") return <p className="text-muted">{dict.loading}</p>;
  if (state === "error") return <p className="text-sm text-err-fg">{dict.payError}</p>;

  // Seat-aware recompute: committed total scales linearly with the draft seat count, plus
  // the staged add-ons (per-seat × draft seats).
  const perSeatCommitted = cur.seats > 0 ? cur.total / cur.seats : 0;
  const newTotal = perSeatCommitted * seats + addedRate(resolvedAddons, selected) * seats;
  const delta = newTotal - cur.total;
  const dirty = selected.size > 0 || seats !== cur.seats;
  const perSeatNow = seats > 0 ? newTotal / seats : 0;

  const renewDate = cur.periodEnd
    ? (() => {
        try {
          return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(cur.periodEnd));
        } catch {
          return cur.periodEnd;
        }
      })()
    : "";

  // Demo-only lifecycle banner copy (the "Aperçu état du compte" preview). Illustrative —
  // dates/figures mirror the design mockup; not driven by live data beyond the renewal date.
  const L =
    lang === "en"
      ? {
          activeLabel: "Subscription active",
          activeTail: ` · next renewal${renewDate ? ` on ${renewDate}` : ""}. Automatic payment on Visa ••42.`,
          trialEyebrow: "Trial period",
          trialTitle: "Free trial — 9 days left",
          trialBody: "Your trial ends on 8 March 2026. Add a payment method to keep your data and move to the Business plan without interruption.",
          trialCta: "Add a payment method",
          trialProgress: "Day 5 / 14",
          graceEyebrow: "Action required",
          graceTitle: "Payment failed — access kept until 14 March",
          graceBody: "The 28 Feb charge failed. Your full access is kept during the grace period. Without payment, your workspace will automatically switch to read-only (Essential plan) at the end of the window.",
          graceCta: "Update card",
          graceCta2: "View invoice",
          graceProgress: "11 days before downgrade",
          downEyebrow: "Account downgraded",
          downTitle: "Business plan suspended — workspace read-only",
          downBody: "Payment wasn't settled within the grace period. Your workspace reverted to Essential: advanced modules are read-only and payroll is suspended. Your data is kept for 90 days — reactivate anytime.",
          downCta: "Reactivate Business plan",
        }
      : {
          activeLabel: "Abonnement actif",
          activeTail: ` · prochain renouvellement${renewDate ? ` le ${renewDate}` : ""}. Paiement automatique sur Visa ••42.`,
          trialEyebrow: "Période d'essai",
          trialTitle: "Essai gratuit — 9 jours restants",
          trialBody: "Votre essai se termine le 8 mars 2026. Ajoutez un moyen de paiement pour conserver vos données et passer en offre Business sans interruption.",
          trialCta: "Ajouter un moyen de paiement",
          trialProgress: "Jour 5 / 14",
          graceEyebrow: "Action requise",
          graceTitle: "Paiement échoué — accès maintenu jusqu'au 14 mars",
          graceBody: "Le prélèvement du 28 févr. a échoué. Votre accès complet est conservé pendant la période de grâce. Sans régularisation, votre espace passera automatiquement en lecture seule (offre Essentiel) à la fin du délai.",
          graceCta: "Mettre à jour la carte",
          graceCta2: "Voir la facture",
          graceProgress: "11 jours avant rétrogradation",
          downEyebrow: "Compte rétrogradé",
          downTitle: "Offre Business suspendue — espace en lecture seule",
          downBody: "Le paiement n'a pas été régularisé dans le délai de grâce. Votre espace est repassé sur Essentiel : les modules avancés sont en lecture seule et la paie est suspendue. Vos données sont conservées 90 jours — réactivez à tout moment.",
          downCta: "Réactiver l'offre Business",
        };

  function toggle(code: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });
    setSaved(false);
  }
  function resetDraft() {
    setSelected(new Set());
    setSeats(cur.seats);
  }
  async function save() {
    // Persist via the backend. The update_plan_modules handler stages module add/remove;
    // the draft seat count rides along (best-effort seam) so the same Save commits both.
    setSaveErr(null);
    setSaving(true);
    const res = await apiAuthed("update_plan_modules", { add: Array.from(selected), seats });
    setSaving(false);
    if (!res.ok) {
      setSaveErr(res.error || dict.planSaveError);
      return;
    }
    setSelected(new Set());
    setCur((c) => ({ ...c, seats, total: newTotal, activeModules: c.activeModules + selected.size }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Account-state preview switcher (demo) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-dashed border-line bg-mist px-3 py-2.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted">{dict.statePreview}</span>
        <div className="flex flex-wrap gap-1.5">
          {STATES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setLife(s.key)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                s.key === life ? "border-sky bg-tint-sky text-sky-text" : "border-line text-muted hover:border-sky"
              }`}
            >
              {dict[s.dict]}
            </button>
          ))}
        </div>
      </div>

      {/* Lifecycle banner — reflects the selected preview state */}
      {life === "active" && (
        <div className="flex items-center gap-3 rounded-2xl border border-ok-fg bg-ok-bg px-[18px] py-3.5">
          <CheckCircle2 size={20} className="flex-none text-ok-fg" />
          <p className="text-sm text-ink">
            <span className="font-extrabold text-ok-fg">{L.activeLabel}</span>
            {L.activeTail}
          </p>
        </div>
      )}

      {life === "trial" && (
        <div className="flex flex-col rounded-2xl border border-info-fg bg-info-bg px-5 py-[18px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <Clock size={22} className="mt-0.5 flex-none text-info-fg" />
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-info-fg">{L.trialEyebrow}</div>
                <div className="mt-0.5 text-base font-extrabold text-heading">{L.trialTitle}</div>
                <p className="mt-1 max-w-[520px] text-[13.5px] leading-relaxed text-ink">{L.trialBody}</p>
              </div>
            </div>
            <button type="button" className="flex-none rounded-full bg-info-fg px-[18px] py-2.5 text-[13.5px] font-bold text-white">
              {L.trialCta}
            </button>
          </div>
          <div className="mt-3.5 flex items-center gap-2.5">
            <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-info-fg" style={{ width: "36%" }} />
            </div>
            <span className="whitespace-nowrap text-xs font-bold text-info-fg">{L.trialProgress}</span>
          </div>
        </div>
      )}

      {life === "grace" && (
        <div className="flex flex-col rounded-2xl border border-warn-border bg-warn-bg px-5 py-[18px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <AlertTriangle size={22} className="mt-0.5 flex-none text-warn-fg" />
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-warn-fg">{L.graceEyebrow}</div>
                <div className="mt-0.5 text-base font-extrabold text-heading">{L.graceTitle}</div>
                <p className="mt-1 max-w-[560px] text-[13.5px] leading-relaxed text-ink">{L.graceBody}</p>
              </div>
            </div>
            <div className="flex flex-none flex-col gap-2">
              <button type="button" className="rounded-full bg-warn-fg px-[18px] py-2.5 text-[13.5px] font-bold text-white">
                {L.graceCta}
              </button>
              <button type="button" className="rounded-full border border-warn-border px-[18px] py-2 text-[13px] font-bold text-warn-fg">
                {L.graceCta2}
              </button>
            </div>
          </div>
          <div className="mt-3.5 flex items-center gap-2.5">
            <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-warn-fg" style={{ width: "78%" }} />
            </div>
            <span className="whitespace-nowrap text-xs font-bold text-warn-fg">{L.graceProgress}</span>
          </div>
        </div>
      )}

      {life === "downgraded" && (
        <div className="flex flex-col rounded-2xl border border-err-fg bg-err-bg px-5 py-[18px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <ArrowDown size={22} className="mt-0.5 flex-none text-err-fg" />
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-err-fg">{L.downEyebrow}</div>
                <div className="mt-0.5 text-base font-extrabold text-heading">{L.downTitle}</div>
                <p className="mt-1 max-w-[560px] text-[13.5px] leading-relaxed text-ink">{L.downBody}</p>
              </div>
            </div>
            <button type="button" className="flex-none rounded-full bg-err-fg px-[18px] py-2.5 text-[13.5px] font-bold text-white">
              {L.downCta}
            </button>
          </div>
        </div>
      )}

      {/* Current offer */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-sky-text">{dict.planOffer}</p>
            <h3 className="mt-1.5 text-2xl font-extrabold tracking-tight text-heading">{cur.plan || "—"}</h3>
            <p className="mt-1.5 max-w-[400px] text-sm leading-relaxed text-muted">{dict.planOfferDesc}</p>
          </div>
          <div className="text-right">
            <div>
              <span className="text-[30px] font-extrabold text-heading">{money(newTotal, cur.currency)}</span>
              <span className="text-sm font-semibold text-muted"> {dict.planPerMonth}</span>
            </div>
            {renewDate && (
              <div className="mt-1 text-[12.5px] text-muted">
                {dict.planRenewal} <span className="font-bold text-ink">{renewDate}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-line bg-mist px-4 py-3.5">
            <div className="text-xs font-semibold text-muted">{dict.planSeats}</div>
            <div className="mt-2 flex items-center gap-2.5">
              <button
                type="button"
                aria-label={dict.seatMinus}
                onClick={() => {
                  setSeats((s) => Math.max(1, s - 1));
                  setSaved(false);
                }}
                disabled={seats <= 1}
                className="inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg border border-line bg-surface text-[17px] font-bold leading-none text-ink transition hover:border-sky disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-[36px] text-center text-[22px] font-extrabold text-heading">{seats}</span>
              <button
                type="button"
                aria-label={dict.seatPlus}
                onClick={() => {
                  setSeats((s) => s + 1);
                  setSaved(false);
                }}
                className="inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg border border-line bg-surface text-[17px] font-bold leading-none text-ink transition hover:border-sky"
              >
                +
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-mist px-4 py-3.5">
            <div className="text-xs font-semibold text-muted">{dict.planActiveModules}</div>
            <div className="mt-2 text-[22px] font-extrabold text-heading">{cur.activeModules + selected.size}</div>
          </div>
          <div className="rounded-xl border border-line bg-mist px-4 py-3.5">
            <div className="text-xs font-semibold text-muted">{dict.planCostPerSeat}</div>
            <div className="mt-2 text-[22px] font-extrabold text-sky-text">{money(perSeatNow, cur.currency)}</div>
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
                      {money(a.rate * seats, cur.currency)} {dict.planPerMonth}
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
              <span className={delta >= 0 ? "text-ok-fg" : "text-err-fg"}>
                ({delta >= 0 ? "+" : ""}
                {money(delta, cur.currency)})
              </span>
            </span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={resetDraft} className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-ink">
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
