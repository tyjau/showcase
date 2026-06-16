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
