// Client-side calls to the public backend actions (signup funnel). The browser
// hits the guardian backend directly; the backend's CORS allows the showcase
// origin. NEXT_PUBLIC_API_BASE is the public guardian URL in prod; it defaults
// to the local dev backend.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://saas.test:8443";

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
const WORKSPACE_KEY = "skyrh.portal.workspace";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getWorkspace(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(WORKSPACE_KEY);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WORKSPACE_KEY);
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
      body: JSON.stringify({ email, password }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      meta?: { code?: number };
      data?: { access_token?: string };
      error?: string;
    };
    const code = json?.meta?.code ?? res.status;
    if (!res.ok || code >= 400) return { ok: false, error: json?.error || `Error ${code}` };
    const token = json?.data?.access_token;
    if (!token) return { ok: false, error: "No token returned" };
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(WORKSPACE_KEY, workspace);
    } catch {
      /* storage unavailable */
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

/** POST a JWT-scoped action with the stored Bearer token. status 401 ⇒ session expired. */
export async function apiAuthed(
  action: string,
  body: Record<string, unknown> = {},
): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string; status?: number }> {
  const token = getToken();
  if (!token) return { ok: false, error: "Not signed in", status: 401 };
  try {
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
    if (!res.ok || code >= 400) return { ok: false, error: json?.error || `Error ${code}`, status: code };
    return { ok: true, data: json?.data };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}
