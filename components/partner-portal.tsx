"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiAuthed, getToken, clearSession } from "@/lib/api";

type Dict = Record<string, string>;
type Referral = {
  referred_email: string | null;
  status: string;
  reward_amount: number | null;
  created_at: string;
  converted_at: string | null;
};
type Data = {
  is_referrer: boolean;
  code: string | null;
  brand_name: string | null;
  reward_type: string | null;
  reward_value: number | null;
  currency: string | null;
  reward_total: number;
  referrals: Referral[];
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}

// Dedicated partner/reseller surface (distinct from the account portal's Parrainage tab):
// referral code + shareable link, reward config, referrals + commissions. Reuses my_referrals.
export function PartnerPortal({ lang, dict }: { lang: string; dict: Dict }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "out" | "ready">("loading");
  const [d, setD] = useState<Data | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setState("out");
      return;
    }
    apiAuthed("my_referrals").then((res) => {
      if (!res.ok) {
        if (res.status === 401) clearSession();
        setState("out");
        return;
      }
      setD(res.data as Data);
      setState("ready");
    });
  }, []);

  function logout() {
    clearSession();
    router.push(`/${lang}/login`);
  }

  if (state === "loading") return <p className="text-muted">{dict.loading}</p>;
  if (state === "out") {
    return (
      <div>
        <p className="text-muted">{dict.signedOut}</p>
        <Link href={`/${lang}/login`} className="mt-4 inline-flex rounded-full bg-sky px-6 py-3 text-sm font-semibold text-white">
          {dict.signin}
        </Link>
      </div>
    );
  }

  const link = typeof window !== "undefined" && d?.code ? `${window.location.origin}/${lang}/signup?ref=${d.code}` : "";
  const referrals = d?.referrals ?? [];
  const converted = referrals.filter((r) => r.status === "converted").length;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{dict.title}</h1>
          <p className="text-muted">{dict.subtitle}</p>
        </div>
        <button onClick={logout} className="shrink-0 text-sm text-muted hover:text-ink">
          {dict.logout}
        </button>
      </div>

      {!d?.is_referrer ? (
        <div className="mt-8 rounded-xl border border-line p-6">
          <p className="text-muted">{dict.notPartner}</p>
          <a href="mailto:partners@skyrh.com" className="mt-4 inline-flex rounded-full bg-sky px-6 py-2.5 text-sm font-semibold text-white">
            {dict.becomePartner}
          </a>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Metric label={dict.mReferrals} value={String(referrals.length)} />
            <Metric label={dict.mConverted} value={String(converted)} />
            <Metric label={dict.mEarned} value={`${d.reward_total ?? 0} ${d.currency ?? ""}`.trim()} />
          </div>

          <div className="mt-6 rounded-xl border border-line p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{dict.codeLabel}</p>
            <p className="mt-1 font-mono text-lg font-bold text-navy">{d.code}</p>
            {d.reward_value != null && (
              <p className="mt-2 text-sm text-muted">
                {dict.rewardLabel}: {d.reward_value}
                {d.reward_type === "percent" ? "%" : ` ${d.currency ?? ""}`}
              </p>
            )}
            <div className="mt-4">
              <p className="mb-1 text-xs font-medium text-ink">{dict.shareLabel}</p>
              <div className="flex items-stretch gap-2">
                <input readOnly value={link} className="w-full rounded-lg border border-line px-3 py-2 text-sm text-muted" />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="shrink-0 rounded-full bg-sky px-4 py-2 text-sm font-semibold text-white"
                >
                  {copied ? dict.copied : dict.copy}
                </button>
              </div>
            </div>
          </div>

          <h2 className="mt-8 text-lg font-bold text-navy">{dict.referralsTitle}</h2>
          {referrals.length === 0 ? (
            <p className="mt-3 text-muted">{dict.noReferrals}</p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-mist text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">{dict.colEmail}</th>
                    <th className="px-4 py-2.5 font-semibold">{dict.colStatus}</th>
                    <th className="px-4 py-2.5 font-semibold">{dict.colDate}</th>
                    <th className="px-4 py-2.5 text-right font-semibold">{dict.colReward}</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="px-4 py-2.5">{r.referred_email || "—"}</td>
                      <td className="px-4 py-2.5">{r.status}</td>
                      <td className="px-4 py-2.5 text-muted">{(r.converted_at || r.created_at || "").slice(0, 10)}</td>
                      <td className="px-4 py-2.5 text-right">{r.reward_amount ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
