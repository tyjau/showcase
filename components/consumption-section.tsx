"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiAuthed } from "@/lib/api";
import { formatRate } from "@/lib/money";

type Dict = Record<string, string>;
type Line = { kind: string; label: string; quantity: number; unit_amount: number; amount: number };
type Consumption = {
  has_subscription: boolean;
  order_status?: string;
  currency?: string;
  billing_unit?: string;
  seats?: number;
  active_modules?: number;
  period_start?: string;
  period_end?: string;
  lines?: Line[];
  subtotal?: number;
  discount_total?: number;
  total?: number;
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-heading">{value}</p>
    </div>
  );
}

// Consumption detail (#7) — current-period projected bill from my_consumption, the same
// breakdown the billing run produces (plan package + add-ons + discounts).
export function ConsumptionSection({ dict }: { dict: Dict }) {
  const lang = (usePathname() || "").split("/")[1] === "en" ? "en" : "fr";
  const money = (n: number, c: string) => formatRate(n, c, lang);
  const [data, setData] = useState<Consumption | null>(null);
  const [state, setState] = useState<"loading" | "error" | "ready" | "none">("loading");

  useEffect(() => {
    apiAuthed("my_consumption").then((res) => {
      if (!res.ok) {
        setState("error");
        return;
      }
      const d = res.data as Consumption;
      if (!d?.has_subscription) {
        setState("none");
        return;
      }
      setData(d);
      setState("ready");
    });
  }, []);

  if (state === "loading") return <p className="text-muted">{dict.loading}</p>;
  if (state === "error") return <p className="text-sm text-err-fg">{dict.payError}</p>;
  if (state === "none" || !data) return <p className="text-muted">{dict.empty}</p>;

  const cur = data.currency || "USD";
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label={dict.consSeats} value={String(data.seats ?? 0)} />
        <Metric label={dict.consModules} value={String(data.active_modules ?? 0)} />
        <Metric label={dict.consProjected} value={money(data.total ?? 0, cur)} />
      </div>
      <p className="mt-3 text-sm text-muted">
        {dict.consPeriod}: {data.period_start} → {data.period_end} ·{" "}
        {data.billing_unit === "per_company" ? dict.consFlat : dict.consPerSeat}
      </p>

      <h3 className="mt-6 text-sm font-bold text-heading">{dict.consBreakdown}</h3>
      <div className="mt-2 overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2.5 font-semibold">{dict.consItem}</th>
              <th className="px-4 py-2.5 text-right font-semibold">{dict.consQty}</th>
              <th className="px-4 py-2.5 text-right font-semibold">{dict.consUnit}</th>
              <th className="px-4 py-2.5 text-right font-semibold">{dict.consAmount}</th>
            </tr>
          </thead>
          <tbody>
            {(data.lines ?? []).map((l, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-4 py-2.5">{l.label}</td>
                <td className="px-4 py-2.5 text-right">{l.quantity}</td>
                <td className="px-4 py-2.5 text-right text-muted">{money(l.unit_amount, cur)}</td>
                <td className="px-4 py-2.5 text-right font-semibold">{money(l.amount, cur)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-line bg-mist">
              <td className="px-4 py-2.5 font-semibold" colSpan={3}>
                {dict.consTotal}
              </td>
              <td className="px-4 py-2.5 text-right font-bold text-heading">{money(data.total ?? 0, cur)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
