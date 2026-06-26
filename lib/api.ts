// Client-side calls to the public backend actions (signup funnel). The browser
// hits the guardian backend directly; the backend's CORS allows the showcase
// origin. NEXT_PUBLIC_API_BASE is the public guardian URL in prod; it defaults
// to the local dev backend.
import { PORTAL_MOCK, MOCK_TOKEN, MOCK_WORKSPACE, mockAuthed } from "./portal-mock";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://saas.test:8443";

// A partner has no tenant workspace, but guardian's `login` action requires a `company`
// (it resolves the tenant for the request). Partners live on the operator/platform
// company, so partner login passes that company. Configurable per deployment.
const PARTNER_COMPANY =
  process.env.NEXT_PUBLIC_PARTNER_COMPANY || "skyrh";

export function apiUrl(action: string): string {
  return `${API_BASE}/auth.php?c=${action}`;
}

export async function apiPost(
  action: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(apiUrl(action), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      meta?: { code?: number };
      data?: Record<string, unknown>;
      error?: string;
    };
    const code = json?.meta?.code ?? res.status;
    if (!res.ok || code >= 400) {
      return { ok: false, error: json?.error || `Error ${code}` };
    }
    return { ok: true, data: json?.data };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

// ── Client portal session (account + billing). The portal authenticates with the
// account owner's tenant credentials; the access token is held in localStorage and
// sent as a Bearer to JWT-scoped endpoints (my_invoices). No portal server. ─────────
const TOKEN_KEY = "skyrh.portal.token";
const REFRESH_KEY = "skyrh.portal.refresh";
const WORKSPACE_KEY = "skyrh.portal.workspace";
// The login also mints a rich "user token" (name, surname, avatar, role…) — kept so the
// header + greeting can show the person, since the lean access_token has no name claim.
const USER_TOKEN_KEY = "skyrh.portal.user";
// Local override for the avatar after an in-session update (the user token is only
// refreshed at next login), so the header/settings reflect a new upload immediately.
const AVATAR_KEY = "skyrh.portal.avatar";
// Same-tab components can't hear `storage`, so profile updates broadcast this instead.
export const PROFILE_EVENT = "skyrh:profile";
// A partner (referrer) session reuses the SAME token slots as the billing portal —
// the partner JWT (scope=partner) is the Bearer for my_referrals + update_referrer_cobrand,
// so /partner reads it via getToken() exactly like /account. We additionally cache the
// referrer payload returned by login so the co-brand editor can prefill without a round-trip.
const REFERRER_KEY = "skyrh.partner.referrer";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  if (PORTAL_MOCK) return MOCK_TOKEN; // dev portal preview
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Decode the `scope` claim from the current access token (e.g. "partner"), or null.
 * The tenant portal and the partner area SHARE this token slot, so partner-specific
 * callers (e.g. the partner-login redirect) must gate on scope, not mere token presence —
 * otherwise a leftover tenant token bounces a partner applicant off the login form.
 * Best-effort, base64url-safe; any decode failure yields null (treated as "not partner").
 */
export function tokenScope(): string | null {
  const t = getToken();
  if (!t) return null;
  try {
    const seg = (t.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(seg)) as { scope?: string };
    return payload?.scope ?? null;
  } catch {
    return null;
  }
}

/** The rich user token (name / surname / avatar / role), kept beside the lean access
 * token — the access token has no name claim. Mock-aware for the dev portal preview. */
function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  if (PORTAL_MOCK) return MOCK_TOKEN; // dev portal preview (carries a name)
  try {
    return localStorage.getItem(USER_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Best-effort base64url-safe decode of a string claim from a JWT payload; null on miss. */
function decodeClaim(token: string | null, claim: string): string | null {
  if (!token) return null;
  try {
    const seg = (token.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(seg)) as Record<string, unknown>;
    const v = payload[claim];
    return typeof v === "string" && v ? v : null;
  } catch {
    return null;
  }
}

/** Display name for the portal greeting ("Bonjour, {name}"), from the user token. */
export function getSessionName(): string | null {
  return decodeClaim(getUserToken(), "name");
}

/** Account email from the user token (for pre-filling forms when already signed in). */
export function getSessionEmail(): string | null {
  return decodeClaim(getUserToken(), "email");
}

/** Avatar (data-URL or URL): the in-session local override if present, else the user
 * token's avatar claim, else null. */
export function getSessionAvatar(): string | null {
  if (typeof window !== "undefined" && !PORTAL_MOCK) {
    try {
      const local = localStorage.getItem(AVATAR_KEY);
      if (local) return local;
    } catch {
      /* storage unavailable */
    }
  }
  return decodeClaim(getUserToken(), "avatar");
}

export function getWorkspace(): string | null {
  if (typeof window === "undefined") return null;
  if (PORTAL_MOCK) return MOCK_WORKSPACE; // dev portal preview
  try {
    return localStorage.getItem(WORKSPACE_KEY);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(WORKSPACE_KEY);
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(AVATAR_KEY);
    localStorage.removeItem(REFERRER_KEY);
  } catch {
    /* storage unavailable */
  }
}

/** Login is tenant-scoped (?company=<workspace>); on success we keep the token + workspace. */
export async function apiLogin(
  workspace: string,
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${apiUrl("login")}&company=${encodeURIComponent(workspace)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // scope=billing: the portal only needs a session for invoices + checkout, so a
      // pending pay_first tenant can authenticate to pay (the HR module gate is skipped
      // server-side; HR access stays gated on order_status).
      body: JSON.stringify({ email, password, scope: "billing" }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      meta?: { code?: number };
      data?: { access_token?: string; refresh_token?: string; user_token?: string };
      error?: string;
    };
    const code = json?.meta?.code ?? res.status;
    if (!res.ok || code >= 400) return { ok: false, error: json?.error || `Error ${code}` };
    const token = json?.data?.access_token;
    if (!token) return { ok: false, error: "No token returned" };
    try {
      localStorage.setItem(TOKEN_KEY, token);
      if (json?.data?.refresh_token) localStorage.setItem(REFRESH_KEY, json.data.refresh_token);
      if (json?.data?.user_token) localStorage.setItem(USER_TOKEN_KEY, json.data.user_token);
      localStorage.setItem(WORKSPACE_KEY, workspace);
    } catch {
      /* storage unavailable */
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

/** Request a password-reset link. Tenant-scoped like login (?company=<workspace>): the
 * backend emails a one-time link to the canonical reset page when the account exists.
 * Anti-enumeration — a 200 always returns the same "if it exists, we sent it" message. */
export async function apiSendResetLink(
  workspace: string,
  email: string,
): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${apiUrl("send_reset_link")}&company=${encodeURIComponent(workspace)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = (await res.json().catch(() => ({}))) as { meta?: { code?: number }; data?: string; error?: string };
    const code = json?.meta?.code ?? res.status;
    if (!res.ok || code >= 400) return { ok: false, error: json?.error || `Error ${code}` };
    return { ok: true, message: typeof json?.data === "string" ? json.data : undefined };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

// Persist a session minted elsewhere (e.g. signup_confirm auto-login) so the funnel can
// land a new pay_first customer authenticated on /account without a second login round-trip.
export function storeSession(
  workspace: string,
  accessToken: string,
  refreshToken?: string | null,
  userToken?: string | null,
): void {
  try {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    if (userToken) localStorage.setItem(USER_TOKEN_KEY, userToken);
    if (workspace) localStorage.setItem(WORKSPACE_KEY, workspace);
  } catch {
    /* storage unavailable */
  }
}

// Social login (Google / Microsoft). The browser obtains a provider id_token (or, in dev mock
// mode, a `mock:<email>` token); the backend validates it + issues the session. scope=billing
// like apiLogin. Reuses storeSession on success.
export async function apiLoginOAuth(
  workspace: string,
  provider: "google" | "microsoft",
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${apiUrl("login")}&company=${encodeURIComponent(workspace)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, token, scope: "billing" }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      meta?: { code?: number };
      data?: { access_token?: string; refresh_token?: string; user_token?: string };
      error?: string;
    };
    const code = json?.meta?.code ?? res.status;
    if (!res.ok || code >= 400) return { ok: false, error: json?.error || `Error ${code}` };
    const tok = json?.data?.access_token;
    if (!tok) return { ok: false, error: "No token returned" };
    storeSession(workspace, tok, json?.data?.refresh_token ?? null, json?.data?.user_token ?? null);
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

function getRefresh(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

/** Exchange the refresh token for a fresh access token (the access token lives ~1h).
 * Rotation-safe: stores a new refresh token if the backend returns one. Clears the
 * session on a hard failure so the UI falls back to signed-out cleanly. */
async function refreshAccess(): Promise<boolean> {
  const rt = getRefresh();
  if (!rt) return false;
  try {
    const res = await fetch(apiUrl("refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      meta?: { code?: number };
      data?: { access_token?: string; refresh_token?: string };
    };
    const code = json?.meta?.code ?? res.status;
    const token = json?.data?.access_token;
    if (!res.ok || code >= 400 || !token) {
      clearSession();
      return false;
    }
    try {
      localStorage.setItem(TOKEN_KEY, token);
      if (json?.data?.refresh_token) localStorage.setItem(REFRESH_KEY, json.data.refresh_token);
    } catch {
      /* storage unavailable */
    }
    return true;
  } catch {
    return false;
  }
}

async function doAuthed(action: string, body: Record<string, unknown>, token: string) {
  const res = await fetch(apiUrl(action), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    meta?: { code?: number };
    data?: Record<string, unknown>;
    error?: string;
  };
  const code = json?.meta?.code ?? res.status;
  return { ok: res.ok && code < 400, code, json };
}

/** POST a JWT-scoped action with the stored Bearer token. On 401, transparently
 * refresh the access token (it expires ~1h) and retry once — so the portal session
 * outlives a single access token instead of silently dropping to signed-out. */
export async function apiAuthed(
  action: string,
  body: Record<string, unknown> = {},
): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string; status?: number }> {
  if (PORTAL_MOCK) return mockAuthed(action); // dev portal preview — canned data
  let token = getToken();
  if (!token) return { ok: false, error: "Not signed in", status: 401 };
  try {
    let r = await doAuthed(action, body, token);
    if (r.code === 401 && (await refreshAccess())) {
      token = getToken();
      if (token) r = await doAuthed(action, body, token);
    }
    if (!r.ok) return { ok: false, error: r.json?.error || `Error ${r.code}`, status: r.code };
    return { ok: true, data: r.json?.data };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

/** Update the account owner's avatar (data-URL or URL) via the billing-scope
 * update_profile action, then cache it locally + broadcast PROFILE_EVENT so the header
 * and settings reflect it immediately (the user token only refreshes at next login). */
export async function apiUpdateAvatar(avatar: string): Promise<{ ok: boolean; error?: string }> {
  const res = await apiAuthed("update_profile", { avatar });
  if (!res.ok) return { ok: false, error: res.error };
  try {
    localStorage.setItem(AVATAR_KEY, avatar);
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {
    /* storage unavailable */
  }
  return { ok: true };
}

// ── Partner (referrer) lifecycle ───────────────────────────────────────────────
// A "partner" is a users row linked to a referrer via referrers.owner_user_id. It has
// NO company tenant / active modules (login scope=partner ~ scope=billing + allowEmptyModules).
// The partner JWT carries scope=partner and is the Bearer for my_referrals +
// update_referrer_cobrand; the router guard blocks it from any tenant/billing endpoint.

export type Referrer = {
  code: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  domain: string | null;
  reward_type: string | null;
  reward_value: number | null;
  currency: string | null;
  status: string | null;
};

/** Cached referrer payload from the last partner login — lets the co-brand editor
 * prefill its fields without waiting for a fetch. Returns null if absent/corrupt. */
export function getReferrer(): Referrer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REFERRER_KEY);
    return raw ? (JSON.parse(raw) as Referrer) : null;
  } catch {
    return null;
  }
}

function storeReferrer(ref: Referrer | null | undefined): void {
  if (!ref) return;
  try {
    localStorage.setItem(REFERRER_KEY, JSON.stringify(ref));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Partner login. Unlike apiLogin (tenant-scoped, ?company=<workspace>), a partner has no
 * workspace: we authenticate the user behind the referrer with scope=partner and keep the
 * partner JWT in the shared token slot so /partner (my_referrals) works like /account. The
 * returned referrer is cached for the co-brand editor. Returns it so callers can branch.
 */
export async function apiLoginPartner(
  email: string,
  password: string,
): Promise<{ ok: boolean; referrer?: Referrer; error?: string }> {
  try {
    const res = await fetch(`${apiUrl("login")}&company=${encodeURIComponent(PARTNER_COMPANY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, scope: "partner" }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      meta?: { code?: number };
      data?: { access_token?: string; refresh_token?: string; referrer?: Referrer };
      error?: string;
    };
    const code = json?.meta?.code ?? res.status;
    if (!res.ok || code >= 400) return { ok: false, error: json?.error || `Error ${code}` };
    const token = json?.data?.access_token;
    if (!token) return { ok: false, error: "No token returned" };
    try {
      localStorage.setItem(TOKEN_KEY, token);
      if (json?.data?.refresh_token) localStorage.setItem(REFRESH_KEY, json.data.refresh_token);
      // A partner has no workspace slug; clear any stale tenant workspace from a prior session.
      localStorage.removeItem(WORKSPACE_KEY);
    } catch {
      /* storage unavailable */
    }
    storeReferrer(json?.data?.referrer);
    return { ok: true, referrer: json?.data?.referrer };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

/** Update the caller's OWN referrer co-brand (resolved server-side from the JWT
 * owner_user_id). JWT-scoped (scope=partner) via apiAuthed → inherits the 401-refresh.
 * Re-caches the returned referrer so the editor + preview stay in sync after a save. */
export async function apiUpdateCobrand(fields: {
  brand_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  domain: string;
}): Promise<{ ok: boolean; referrer?: Referrer; error?: string }> {
  const res = await apiAuthed("update_referrer_cobrand", fields);
  if (!res.ok) return { ok: false, error: res.error };
  const referrer = res.data?.referrer as Referrer | undefined;
  storeReferrer(referrer);
  return { ok: true, referrer };
}

/** Public contact / demo request (the /contact form). PUBLIC + rate-limited server-side
 * (like signup_request). Captures a sales lead; returns a confirmation message. */
export async function apiRequestDemo(fields: {
  email: string;
  message: string;
  name?: string;
  company?: string;
  subject?: string;
  turnstile_token?: string;
}): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await apiPost("request_demo", fields);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, message: res.data?.message as string | undefined };
}

/** Self-service "become a partner" request. PUBLIC + rate-limited (like signup_request):
 * creates a referrers row status=pending + provisions a user with a magic link. Reward
 * terms are left NULL (the operator sets them on approval). 409 if the code is taken. */
export async function apiRequestPartner(fields: {
  email: string;
  name: string;
  code: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
}): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await apiPost("request_partner", fields);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, message: res.data?.message as string | undefined };
}
