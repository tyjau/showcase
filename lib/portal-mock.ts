// Dev-only mock for the account/partner portal so it can be rendered + visually
// audited WITHOUT a real backend session (the portal is otherwise behind a login
// wall). Gated on NEXT_PUBLIC_PORTAL_MOCK=1 — never active in prod. getToken /
// getWorkspace / apiAuthed short-circuit to this when the flag is on.

export const PORTAL_MOCK = process.env.NEXT_PUBLIC_PORTAL_MOCK === "1";

// A syntactically-valid JWT-shaped token (header.payload.sig) carrying a billing
// scope + a display name, so tokenScope()/greeting code works without a backend.
function b64url(obj: unknown): string {
  const json = JSON.stringify(obj);
  // btoa exists in the browser; this module is only read client-side under the flag.
  const b64 = typeof btoa === "function" ? btoa(json) : Buffer.from(json).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const MOCK_TOKEN = `${b64url({ alg: "none", typ: "JWT" })}.${b64url({
  scope: "billing",
  name: "Awa Diallo",
  email: "awa@globex.com",
  company: "globex",
})}.mock`;

export const MOCK_WORKSPACE = "globex";

// Canned responses per authed action. Reads mirror the live response shapes the
// portal components consume. Mutations just acknowledge.
const CONSUMPTION = {
  has_subscription: true,
  order_status: "active",
  status: "active",
  plan: "Business",
  currency: "USD",
  billing_unit: "per_employee",
  seats: 42,
  active_modules: 6,
  period_start: "2026-06-01",
  period_end: "2026-06-30",
  lines: [
    { kind: "plan", label: "Business · 42 sièges", quantity: 42, unit_amount: 7, amount: 294 },
    { kind: "addon", label: "Recrutement", quantity: 42, unit_amount: 2, amount: 84 },
    { kind: "addon", label: "Performance & carrière", quantity: 42, unit_amount: 2, amount: 84 },
  ],
  subtotal: 462,
  discount_total: 0,
  total: 462,
};

const MOCK: Record<string, Record<string, unknown>> = {
  my_consumption: CONSUMPTION,
  my_invoices: {
    invoices: [
      { id: 4012, period_start: "2026-06-01", period_end: "2026-06-30", total: 462, paid: 0, outstanding: 462, currency: "USD", status: "issued" },
      { id: 3998, period_start: "2026-05-01", period_end: "2026-05-31", total: 462, paid: 462, outstanding: 0, currency: "USD", status: "paid" },
      { id: 3981, period_start: "2026-04-01", period_end: "2026-04-30", total: 440, paid: 440, outstanding: 0, currency: "USD", status: "paid" },
    ],
  },
  my_payment_method: { brand: "visa", last4: "4242", exp_month: 8, exp_year: 27 },
  my_notification_prefs: { notifications: { billing: true, product: false, security: true } },
  my_referrals: {
    is_referrer: true,
    code: "GLOBEX",
    referrals: [
      { company: "Northwind", status: "active", reward: 120, currency: "USD" },
      { company: "Vantage", status: "pending", reward: 0, currency: "USD" },
    ],
    offers: [],
  },
  my_support_tickets: {
    tickets: [
      { id: 21, subject: "Export comptable Sage", status: "open", updated_at: "2026-06-22" },
      { id: 18, subject: "Ajout de sièges en cours de mois", status: "resolved", updated_at: "2026-06-10" },
    ],
  },
};

export function mockAuthed(action: string): { ok: true; data: Record<string, unknown> } {
  return { ok: true, data: MOCK[action] ?? { ok: true } };
}
