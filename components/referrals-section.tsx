"use client";

import { useEffect, useState } from "react";
import { apiAuthed } from "@/lib/api";

type Dict = Record<string, string>;
type Referral = {
  referred_email: string | null;
  status: string;
  reward_amount: number | null;
  created_at: string;
  converted_at: string | null;
};
type Offer = { code: string | null; kind: string; value_type: string; value: number; currency: string | null };
type Data = {
  is_referrer: boolean;
  code: string | null;
  brand_name: string | null;
  reward_type: string | null;
  reward_value: number | null;
  currency: string | null;
  reward_total: number;
  referrals: Referral[];
  applied_offers: Offer[];
};

function offerValue(value: number, valueType: string, currency: string | null): string {
  return valueType === "percent" ? `${value}%` : `${value} ${currency ?? ""}`.trim();
}

// Referral / partner overview (#4) — the company's own referrer code + referrals + rewards,
// plus the promos applied to its subscription. Read-only (offer creation / payout = Harmony).
export function ReferralsSection({ dict }: { dict: Dict }) {
  const [d, setD] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");

  useEffect(() => {
    apiAuthed("my_referrals").then((res) => {
      if (!res.ok) {
        setState("error");
        return;
      }
      setD(res.data as Data);
      setState("ready");
    });
  }, []);

  if (state === "loading") return <p className="text-muted">{dict.loading}</p>;
  if (state === "error" || !d) return <p className="text-sm text-err-fg">{dict.payError}</p>;

  return (
    <div className="space-y-6">
      {d.is_referrer ? (
        <>
          <div className="rounded-xl border border-line p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{dict.refCode}</p>
            <p className="mt-1 font-mono text-lg font-bold text-heading">{d.code}</p>
            {d.reward_value != null && (
              <p className="mt-2 text-sm text-muted">
                {dict.refReward}: {offerValue(d.reward_value, d.reward_type === "percent" ? "percent" : "amount", d.currency)}
                {d.reward_total > 0 ? ` · ${dict.refRewardTotal}: ${d.reward_total} ${d.currency ?? ""}` : ""}
              </p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-heading">
              {dict.refReferrals} ({d.referrals.length})
            </h3>
            {d.referrals.length === 0 ? (
              <p className="mt-2 text-muted">{dict.refNone}</p>
            ) : (
              <div className="mt-2 overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-mist text-left text-xs uppercase text-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">{dict.refEmail}</th>
                      <th className="px-4 py-2.5 font-semibold">{dict.colStatus}</th>
                      <th className="px-4 py-2.5 text-right font-semibold">{dict.refRewardCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.referrals.map((r, i) => (
                      <tr key={i} className="border-t border-line">
                        <td className="px-4 py-2.5">{r.referred_email || "—"}</td>
                        <td className="px-4 py-2.5">{r.status}</td>
                        <td className="px-4 py-2.5 text-right">{r.reward_amount ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-muted">{dict.refNotPartner}</p>
      )}

      {d.applied_offers.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-heading">{dict.refOffers}</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {d.applied_offers.map((o, i) => (
              <li key={i}>
                {(o.code || o.kind) + ": "}
                {offerValue(o.value, o.value_type, o.currency)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
