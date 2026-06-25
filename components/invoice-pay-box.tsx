"use client";

import { useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiAuthed } from "@/lib/api";

type Dict = Record<string, string>;

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
    // Same sync confirm as pay_first — records the payment by the PaymentIntent's metadata.
    const res = await apiAuthed("pay_order_confirm", { payment_intent_id: paymentIntent.id });
    setSubmitting(false);
    if (!res.ok) {
      setError(dict.payError);
      return;
    }
    onPaid();
  }

  return (
    <div className="mt-3">
      <PaymentElement />
      {error && <p className="mt-2 text-sm text-err-fg">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={!stripe || submitting}
        className={`mt-3 rounded-full px-5 py-2 text-sm font-semibold ${
          stripe && !submitting ? "bg-sky-strong text-white" : "cursor-not-allowed bg-mist text-muted"
        }`}
      >
        {submitting ? dict.paySaving : dict.payNow}
      </button>
    </div>
  );
}

// Reusable Stripe payment box for an already-opened PaymentIntent (pay_invoice). On success it
// confirms via pay_order_confirm (records by the PI's metadata) and calls onPaid.
export function InvoicePayBox({
  dict,
  clientSecret,
  publishableKey,
  onPaid,
}: {
  dict: Dict;
  clientSecret: string;
  publishableKey: string;
  onPaid: () => void;
}) {
  const [stripePromise] = useState<Promise<Stripe | null>>(() => loadStripe(publishableKey));
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <PayForm dict={dict} onPaid={onPaid} />
    </Elements>
  );
}
