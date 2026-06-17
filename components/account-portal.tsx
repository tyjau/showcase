"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiAuthed, getToken, getWorkspace, clearSession } from "@/lib/api";
import { PaymentMethod } from "@/components/payment-method";
import { OrderCheckout } from "@/components/order-checkout";

type Dict = Record<string, string>;
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "skyrh.app";

type Invoice = {
  id: number;
  period_start: string;
  period_end: string;
  currency: string;
  total: number;
  paid: number;
  outstanding: number;
  status: string;
};

function money(n: number, cur: string): string {
  const v = Number(n) || 0;
  if (cur === "XAF") return `${v.toLocaleString("en-US")} XAF`;
  return `${cur === "EUR" ? "€" : "$"}${v.toFixed(2)}`;
}

function StatusChip({ status }: { status: string }) {
  const cls: Record<string, string> = {
    paid: "bg-[#e6f5ec] text-[#2e7d4f]",
    issued: "bg-[#fff4e0] text-[#a96a00]",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls[status] ?? "bg-mist text-muted"}`}>
      {status}
    </span>
  );
}

export function AccountPortal({ lang, dict }: { lang: string; dict: Dict }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "out" | "ready">("loading");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workspace, setWorkspace] = useState<string | null>(null);

  useEffect(() => {
    setWorkspace(getWorkspace());
    if (!getToken()) {
      setState("out");
      return;
    }
    apiAuthed("my_invoices").then((res) => {
      if (!res.ok) {
        if (res.status === 401) clearSession();
        setState("out");
        return;
      }
      setInvoices((res.data?.invoices as Invoice[]) ?? []);
      setState("ready");
    });
  }, []);

  function logout() {
    clearSession();
    router.push(`/${lang}/login`);
  }

  if (state === "loading") {
    return <p className="text-muted">{dict.loading}</p>;
  }

  if (state === "out") {
    return (
      <div>
        <p className="text-muted">{dict.signedOut}</p>
        <Link
          href={`/${lang}/login`}
          className="mt-4 inline-flex rounded-full bg-sky px-6 py-3 text-sm font-semibold text-white"
        >
          {dict.signin}
        </Link>
      </div>
    );
  }

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

      <div className="mt-6">
        <OrderCheckout dict={dict} />
      </div>

      {workspace && (
        <a
          href={`https://${workspace}.${APP_DOMAIN}`}
          className="mt-4 inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy hover:border-sky"
        >
          {dict.openWorkspace} →
        </a>
      )}

      <PaymentMethod dict={dict} />

      <h2 className="mt-8 text-lg font-bold text-navy">{dict.invoicesTitle}</h2>
      {invoices.length === 0 ? (
        <p className="mt-3 text-muted">{dict.empty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-mist text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold">{dict.colPeriod}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{dict.colTotal}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{dict.colPaid}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{dict.colDue}</th>
                <th className="px-4 py-2.5 font-semibold">{dict.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-line">
                  <td className="whitespace-nowrap px-4 py-2.5">
                    {inv.period_start} → {inv.period_end}
                  </td>
                  <td className="px-4 py-2.5 text-right">{money(inv.total, inv.currency)}</td>
                  <td className="px-4 py-2.5 text-right text-muted">{money(inv.paid, inv.currency)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">
                    {money(inv.outstanding, inv.currency)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusChip status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
