"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiAuthed, getToken, getWorkspace, clearSession } from "@/lib/api";
import { PaymentMethod } from "@/components/payment-method";
import { OrderCheckout } from "@/components/order-checkout";
import { ConsumptionSection } from "@/components/consumption-section";
import { ReferralsSection } from "@/components/referrals-section";
import { SettingsSection } from "@/components/settings-section";
import { SupportSection } from "@/components/support-section";
import { InvoicePayBox } from "@/components/invoice-pay-box";

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
    paid: "bg-ok-bg text-ok-fg",
    issued: "bg-info-bg text-info-fg",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls[status] ?? "bg-mist text-muted"}`}>
      {status}
    </span>
  );
}

// Factures tab — invoice list + per-row PDF download (#6, base64 → Blob → download).
function InvoicesTab({ dict }: { dict: Dict }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [downloading, setDownloading] = useState<number | null>(null);
  const [paying, setPaying] = useState<{ id: number; secret: string; pub: string } | null>(null);
  const [payErr, setPayErr] = useState<string | null>(null);

  function load() {
    apiAuthed("my_invoices").then((res) => {
      if (!res.ok) {
        setState("error");
        return;
      }
      setInvoices((res.data?.invoices as Invoice[]) ?? []);
      setState("ready");
    });
  }
  useEffect(() => {
    load();
  }, []);

  async function pay(id: number) {
    setPayErr(null);
    const res = await apiAuthed("pay_invoice", { invoice_id: id });
    const d = res.data || {};
    if (!res.ok || !d.client_secret || !d.publishable_key) {
      setPayErr(dict.payError);
      return;
    }
    setPaying({ id, secret: d.client_secret as string, pub: d.publishable_key as string });
  }

  async function download(id: number) {
    setDownloading(id);
    const res = await apiAuthed("my_invoice_pdf", { id });
    setDownloading(null);
    const b64 = res.data?.pdf_base64 as string | undefined;
    if (!res.ok || !b64) return;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = (res.data?.filename as string) || `facture-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (state === "loading") return <p className="text-muted">{dict.loading}</p>;
  if (state === "error") return <p className="text-sm text-err-fg">{dict.payError}</p>;
  if (invoices.length === 0) return <p className="text-muted">{dict.empty}</p>;

  return (
    <>
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead className="bg-mist text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-2.5 font-semibold">{dict.colPeriod}</th>
            <th className="px-4 py-2.5 text-right font-semibold">{dict.colTotal}</th>
            <th className="px-4 py-2.5 text-right font-semibold">{dict.colPaid}</th>
            <th className="px-4 py-2.5 text-right font-semibold">{dict.colDue}</th>
            <th className="px-4 py-2.5 font-semibold">{dict.colStatus}</th>
            <th className="px-4 py-2.5 text-right font-semibold" />
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
              <td className="px-4 py-2.5 text-right font-semibold">{money(inv.outstanding, inv.currency)}</td>
              <td className="px-4 py-2.5">
                <StatusChip status={inv.status} />
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex justify-end gap-3">
                  {inv.outstanding > 0 && (
                    <button onClick={() => pay(inv.id)} className="font-semibold text-sky hover:underline">
                      {dict.invPay}
                    </button>
                  )}
                  <button
                    onClick={() => download(inv.id)}
                    disabled={downloading === inv.id}
                    className="font-semibold text-sky hover:underline disabled:opacity-50"
                  >
                    {downloading === inv.id ? dict.paySaving : dict.invDownload}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {payErr && <p className="mt-3 text-sm text-err-fg">{payErr}</p>}
    {paying && (
      <div className="mt-4 rounded-xl border border-warn-border bg-warn-bg p-5">
        <p className="font-semibold text-heading">
          {dict.invPayTitle} #{paying.id}
        </p>
        <InvoicePayBox
          dict={dict}
          clientSecret={paying.secret}
          publishableKey={paying.pub}
          onPaid={() => {
            setPaying(null);
            load();
          }}
        />
      </div>
    )}
    </>
  );
}

const TABS = [
  { key: "consumption", anchor: "consumption" },
  { key: "invoices", anchor: "invoices" },
  { key: "payment", anchor: "payment" },
  { key: "referrals", anchor: "referrals" },
  { key: "support", anchor: "support" },
  { key: "settings", anchor: "settings" },
];

export function AccountPortal({ lang, dict }: { lang: string; dict: Dict }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "out" | "ready">("loading");
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [tab, setTab] = useState("consumption");

  useEffect(() => {
    setWorkspace(getWorkspace());
    if (!getToken()) {
      setState("out");
      return;
    }
    setState("ready");
    // Dropdown deep-links (#invoices, #payment, …) open the matching tab.
    const h = window.location.hash.replace("#", "");
    const match = TABS.find((t) => t.anchor === h);
    if (match) setTab(match.key);
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
        <Link
          href={`/${lang}/login`}
          className="mt-4 inline-flex rounded-full bg-sky px-6 py-3 text-sm font-semibold text-white"
        >
          {dict.signin}
        </Link>
      </div>
    );
  }

  const tabLabel: Record<string, string> = {
    consumption: dict.tabConsumption,
    invoices: dict.invoicesTitle,
    payment: dict.payTitle,
    referrals: dict.tabReferrals,
    support: dict.tabSupport,
    settings: dict.tabSettings,
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">{dict.title}</h1>
          <p className="text-muted">{dict.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {workspace && (
            <a
              href={`https://${workspace}.${APP_DOMAIN}`}
              className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-heading hover:border-sky"
            >
              {dict.openWorkspace} →
            </a>
          )}
          <button onClick={logout} className="text-sm text-muted hover:text-ink">
            {dict.logout}
          </button>
        </div>
      </div>

      {/* pay_first banner — always visible while the order is pending */}
      <div className="mt-6">
        <OrderCheckout dict={dict} />
      </div>

      <nav className="mt-6 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key ? "border-sky text-heading" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tabLabel[t.key]}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "consumption" && <ConsumptionSection dict={dict} />}
        {tab === "invoices" && <InvoicesTab dict={dict} />}
        {tab === "payment" && <PaymentMethod dict={dict} />}
        {tab === "referrals" && <ReferralsSection dict={dict} />}
        {tab === "support" && <SupportSection dict={dict} />}
        {tab === "settings" && <SettingsSection dict={dict} />}
      </div>
    </div>
  );
}
