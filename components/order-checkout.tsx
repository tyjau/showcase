"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiAuthed } from "@/lib/api";

type Dict = Record<string, string>;
type Invoice = {
  id: number;
  total: number;
  currency: string;
  period_start?: string | null;
  period_end?: string | null;
};

function money(n: number, cur: string): string {
  const v = Number(n) || 0;
  if (cur === "XAF") return `${v.toLocaleString("en-US")} XAF`;
  return `${cur === "EUR" ? "€" : "$"}${v.toFixed(2)}`;
}

// Inner form (mounted inside <Elements> with the PaymentIntent client_secret). Confirms
// the payment with Stripe, then records it server-side (pay_order_confirm) so the order
// unblocks without depending on the webhook.
function PayForm({ dict, onPaid }: { dict: Dict; onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: confErr, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (confErr || !paymentIntent) {
      setSubmitting(false);
      setError(confErr?.message ?? dict.payError);
      return;
    }
    const res = await apiAuthed("pay_order_confirm", { payment_intent_id: paymentIntent.id });
    setSubmitting(false);
    if (!res.ok) {
      setError(dict.payError);
      return;
    }
    onPaid();
  }

  return (
    <div className="mt-4">
      <PaymentElement />
      {error && <p className="mt-3 text-sm text-err-fg">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={!stripe || submitting}
        className={`mt-4 w-full rounded-full px-6 py-3 text-sm font-semibold ${
          stripe && !submitting ? "bg-sky-strong text-white" : "cursor-not-allowed bg-mist text-muted"
        }`}
      >
        {submitting ? dict.paySaving : dict.payNow}
      </button>
    </div>
  );
}

// pay_first checkout. Shown only when the order is pending (pay_order returns a
// PaymentIntent client_secret); on payment the order activates and access unblocks.
// For trial / already-active orders, pay_order returns already_active and this renders
// nothing.
export function OrderCheckout({ dict, onActivated }: { dict: Dict; onActivated?: () => void }) {
  const [state, setState] = useState<"loading" | "none" | "due" | "paid">("loading");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    apiAuthed("pay_order").then((res) => {
      const d = res.data || {};
      if (!res.ok || d.already_active || !d.client_secret || !d.publishable_key) {
        setState("none");
        return;
      }
      setInvoice(d.invoice as Invoice);
      setStripePromise(loadStripe(d.publishable_key as string));
      setClientSecret(d.client_secret as string);
      setState("due");
    });
  }, []);

  if (state === "loading" || state === "none") return null;

  if (state === "paid") {
    return (
      <section className="mb-8 rounded-xl border border-ok-border bg-ok-bg p-5">
        <p className="font-semibold text-ok-fg">{dict.payThanks}</p>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-xl border border-warn-border bg-warn-bg p-5">
      <h2 className="text-lg font-bold text-heading">{dict.orderPendingTitle}</h2>
      <p className="mt-1 text-sm text-muted">{dict.orderPendingLead}</p>
      {invoice && (
        <p className="mt-2 text-sm font-semibold text-ink">
          {money(invoice.total, invoice.currency)}
          {invoice.period_start ? ` · ${invoice.period_start} → ${invoice.period_end}` : ""}
        </p>
      )}
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <PayForm dict={dict} onPaid={() => { setState("paid"); onActivated?.(); }} />
        </Elements>
      )}
    </section>
  );
}
