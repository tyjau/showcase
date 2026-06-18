"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiAuthed } from "@/lib/api";

type Dict = Record<string, string>;

type Card = {
  brand: string | null;
  last4: string | null;
  exp_month: number | null;
  exp_year: number | null;
};

function brandLabel(b: string | null): string {
  if (!b) return "Carte";
  return b.charAt(0).toUpperCase() + b.slice(1);
}

// Mounted inside <Elements> once a SetupIntent client_secret exists. Collects the
// card, confirms the SetupIntent client-side (PCI stays with Stripe), then asks the
// backend to persist the saved PaymentMethod.
function CardForm({ dict, onSaved, onCancel }: { dict: Dict; onSaved: (c: Card) => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: confErr, setupIntent } = await stripe.confirmSetup({ elements, redirect: "if_required" });
    if (confErr || !setupIntent) {
      setSubmitting(false);
      setError(confErr?.message ?? dict.payError);
      return;
    }
    const res = await apiAuthed("setup_intent_confirm", { setup_intent_id: setupIntent.id });
    setSubmitting(false);
    if (!res.ok) {
      setError(dict.payError);
      return;
    }
    onSaved((res.data?.card as Card) ?? { brand: null, last4: null, exp_month: null, exp_year: null });
  }

  return (
    <div>
      <PaymentElement />
      {error && <p className="mt-3 text-sm text-err-fg">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!stripe || submitting}
          className={`rounded-full px-5 py-2 text-sm font-semibold ${
            stripe && !submitting ? "bg-sky text-white" : "cursor-not-allowed bg-mist text-muted"
          }`}
        >
          {submitting ? dict.paySaving : dict.paySubmit}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink">
          {dict.payCancel}
        </button>
      </div>
    </div>
  );
}

// "Moyen de paiement" section of the account portal. Reads the saved card from the
// backend; "add/update" opens a Stripe SetupIntent and mounts Elements. When the
// rail is unconfigured the backend returns 503 and we show a friendly notice.
export function PaymentMethod({ dict }: { dict: Dict }) {
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<Card | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    apiAuthed("my_payment_method").then((res) => {
      if (res.ok) setCard((res.data?.card as Card) ?? null);
      setLoading(false);
    });
  }, []);

  async function startAdd() {
    setStarting(true);
    setError(null);
    const res = await apiAuthed("my_setup_intent");
    setStarting(false);
    if (!res.ok) {
      setError(res.status === 503 ? dict.payDisabled : dict.payError);
      return;
    }
    const pk = res.data?.publishable_key as string | undefined;
    const cs = res.data?.client_secret as string | undefined;
    if (!pk || !cs) {
      setError(dict.payError);
      return;
    }
    setStripePromise(loadStripe(pk));
    setClientSecret(cs);
  }

  function onSaved(c: Card) {
    setCard(c);
    closeForm();
  }

  function closeForm() {
    setClientSecret(null);
    setStripePromise(null);
  }

  if (loading) return null;
  const adding = !!clientSecret && !!stripePromise;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-heading">{dict.payTitle}</h2>

      {card?.last4 ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-4 py-3">
          <span className="text-sm font-medium text-ink">
            {brandLabel(card.brand)} •••• {card.last4}
          </span>
          <span className="text-sm text-muted">
            {dict.payExpiry} {String(card.exp_month ?? "").padStart(2, "0")}/{card.exp_year}
          </span>
        </div>
      ) : (
        <p className="mt-3 text-muted">{dict.payNone}</p>
      )}

      {!adding && (
        <button
          type="button"
          onClick={startAdd}
          disabled={starting}
          className="mt-4 inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-heading hover:border-sky disabled:opacity-60"
        >
          {starting ? "…" : card?.last4 ? dict.payUpdate : dict.payAdd}
        </button>
      )}

      {error && <p className="mt-3 text-sm text-err-fg">{error}</p>}

      {adding && (
        <div className="mt-4 rounded-xl border border-line p-4">
          <Elements stripe={stripePromise} options={{ clientSecret: clientSecret!, appearance: { theme: "stripe" } }}>
            <CardForm dict={dict} onSaved={onSaved} onCancel={closeForm} />
          </Elements>
        </div>
      )}
    </section>
  );
}
