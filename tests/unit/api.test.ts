// @vitest-environment jsdom
//
// lib/api.ts is the portal session core: token storage, the scope claim, and the
// transparent refresh-on-401 retry. These are the highest-risk paths in the repo
// (a bug = silent sign-out or a session that won't refresh), so they're covered first.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  tokenScope,
  getToken,
  getWorkspace,
  getReferrer,
  clearSession,
  storeSession,
  apiLogin,
  apiLoginPartner,
  apiAuthed,
  apiPost,
  apiLoginOAuth,
  apiUpdateCobrand,
  apiRequestPartner,
} from "@/lib/api";

const TOKEN_KEY = "skyrh.portal.token";
const REFRESH_KEY = "skyrh.portal.refresh";
const WORKSPACE_KEY = "skyrh.portal.workspace";
const REFERRER_KEY = "skyrh.partner.referrer";

/** Forge a JWT whose payload is base64url-encoded, as the real backend issues. */
function jwt(payload: Record<string, unknown>): string {
  const b64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${b64}.signature`;
}

function res(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("tokenScope", () => {
  it("decodes the scope claim from a base64url JWT", () => {
    localStorage.setItem(TOKEN_KEY, jwt({ scope: "partner", sub: 42 }));
    expect(tokenScope()).toBe("partner");
  });

  it("is null with no token, and null on a malformed token", () => {
    expect(tokenScope()).toBeNull();
    localStorage.setItem(TOKEN_KEY, "not.a.jwt");
    expect(tokenScope()).toBeNull();
  });
});

describe("apiLogin", () => {
  it("stores token + refresh + workspace and posts scope=billing", async () => {
    (fetch as any).mockResolvedValue(
      res({ meta: { code: 200 }, data: { access_token: "tok", refresh_token: "ref" } }),
    );
    const r = await apiLogin("acme", "u@x.io", "pw");
    expect(r.ok).toBe(true);
    expect(getToken()).toBe("tok");
    expect(localStorage.getItem(REFRESH_KEY)).toBe("ref");
    expect(getWorkspace()).toBe("acme");

    const [url, init] = (fetch as any).mock.calls[0];
    expect(url).toContain("c=login");
    expect(url).toContain("company=acme");
    expect(JSON.parse(init.body).scope).toBe("billing");
  });

  it("surfaces a backend error and stores nothing", async () => {
    (fetch as any).mockResolvedValue(res({ meta: { code: 401 }, error: "Bad creds" }, false, 401));
    const r = await apiLogin("acme", "u@x.io", "wrong");
    expect(r).toEqual({ ok: false, error: "Bad creds" });
    expect(getToken()).toBeNull();
  });

  it("fails cleanly when the backend returns no token", async () => {
    (fetch as any).mockResolvedValue(res({ meta: { code: 200 }, data: {} }));
    const r = await apiLogin("acme", "u@x.io", "pw");
    expect(r.ok).toBe(false);
    expect(getToken()).toBeNull();
  });
});

describe("apiLoginPartner", () => {
  it("stores the partner token, clears any stale workspace, and caches the referrer", async () => {
    localStorage.setItem(WORKSPACE_KEY, "old-tenant");
    const referrer = { code: "ACME", brand_name: "Acme", status: "active" };
    (fetch as any).mockResolvedValue(
      res({ meta: { code: 200 }, data: { access_token: "ptok", refresh_token: "pref", referrer } }),
    );
    const r = await apiLoginPartner("p@x.io", "pw");
    expect(r.ok).toBe(true);
    expect(getToken()).toBe("ptok");
    expect(getWorkspace()).toBeNull();
    expect(getReferrer()).toMatchObject({ code: "ACME" });

    expect(JSON.parse((fetch as any).mock.calls[0][1].body).scope).toBe("partner");
    // Guardian's login requires a company even for a partner (platform company).
    expect((fetch as any).mock.calls[0][0]).toContain("company=skyrh");
  });
});

describe("apiAuthed refresh-on-401", () => {
  it("refuses when not signed in", async () => {
    const r = await apiAuthed("my_invoices");
    expect(r).toEqual({ ok: false, error: "Not signed in", status: 401 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refreshes the access token on a 401 and retries the action once", async () => {
    localStorage.setItem(TOKEN_KEY, "stale");
    localStorage.setItem(REFRESH_KEY, "ref");
    (fetch as any)
      .mockResolvedValueOnce(res({ meta: { code: 401 } }, false, 401)) // action -> 401
      .mockResolvedValueOnce(res({ meta: { code: 200 }, data: { access_token: "fresh" } })) // refresh
      .mockResolvedValueOnce(res({ meta: { code: 200 }, data: { invoices: [] } })); // retry

    const r = await apiAuthed("my_invoices");
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ invoices: [] });
    expect(getToken()).toBe("fresh");
    expect((fetch as any).mock.calls.length).toBe(3);
    // The retry used the fresh Bearer.
    expect((fetch as any).mock.calls[2][1].headers.Authorization).toBe("Bearer fresh");
  });

  it("clears the session when the refresh itself fails", async () => {
    localStorage.setItem(TOKEN_KEY, "stale");
    localStorage.setItem(REFRESH_KEY, "ref");
    (fetch as any)
      .mockResolvedValueOnce(res({ meta: { code: 401 } }, false, 401)) // action -> 401
      .mockResolvedValueOnce(res({ meta: { code: 401 } }, false, 401)); // refresh fails

    const r = await apiAuthed("my_invoices");
    expect(r.ok).toBe(false);
    expect(getToken()).toBeNull();
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
  });
});

describe("apiPost (public actions)", () => {
  it("returns data on success", async () => {
    (fetch as any).mockResolvedValue(res({ meta: { code: 200 }, data: { ok: 1 } }));
    expect(await apiPost("signup_request", { email: "a@b.io" })).toEqual({ ok: true, data: { ok: 1 } });
  });

  it("returns the backend error on failure", async () => {
    (fetch as any).mockResolvedValue(res({ meta: { code: 400 }, error: "Bad" }, false, 400));
    expect(await apiPost("signup_request", {})).toEqual({ ok: false, error: "Bad" });
  });

  it("returns a network error when fetch throws", async () => {
    (fetch as any).mockRejectedValue(new Error("offline"));
    const r = await apiPost("signup_request", {});
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Network error/);
  });
});

describe("apiLoginOAuth", () => {
  it("stores the minted session and posts provider + token + scope=billing", async () => {
    (fetch as any).mockResolvedValue(
      res({ meta: { code: 200 }, data: { access_token: "otok", refresh_token: "oref" } }),
    );
    const r = await apiLoginOAuth("acme", "google", "id-token-xyz");
    expect(r.ok).toBe(true);
    expect(getToken()).toBe("otok");
    expect(getWorkspace()).toBe("acme");
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body).toMatchObject({ provider: "google", token: "id-token-xyz", scope: "billing" });
  });
});

describe("apiUpdateCobrand", () => {
  it("posts the co-brand via the authed action and re-caches the returned referrer", async () => {
    localStorage.setItem(TOKEN_KEY, "ptok");
    const referrer = { code: "ACME", brand_name: "Acme New", status: "active" };
    (fetch as any).mockResolvedValue(res({ meta: { code: 200 }, data: { referrer } }));
    const r = await apiUpdateCobrand({
      brand_name: "Acme New",
      logo_url: "https://acme.test/logo.png",
      primary_color: "#2563eb",
      secondary_color: "#0f172a",
      domain: "acme.skyrh.app",
    });
    expect(r.ok).toBe(true);
    expect(r.referrer).toMatchObject({ brand_name: "Acme New" });
    expect(getReferrer()).toMatchObject({ code: "ACME" });
    expect((fetch as any).mock.calls[0][0]).toContain("c=update_referrer_cobrand");
  });

  it("surfaces an error without caching when the action fails", async () => {
    localStorage.setItem(TOKEN_KEY, "ptok");
    (fetch as any).mockResolvedValue(res({ meta: { code: 400 }, error: "nope" }, false, 400));
    const r = await apiUpdateCobrand({
      brand_name: "x",
      logo_url: "",
      primary_color: "#fff000",
      secondary_color: "#000fff",
      domain: "",
    });
    expect(r.ok).toBe(false);
    expect(getReferrer()).toBeNull();
  });
});

describe("apiRequestPartner", () => {
  it("relays the public become-partner request and its message", async () => {
    (fetch as any).mockResolvedValue(res({ meta: { code: 200 }, data: { message: "Check your email" } }));
    const r = await apiRequestPartner({ email: "p@x.io", name: "Acme", code: "ACME" });
    expect(r).toEqual({ ok: true, message: "Check your email" });
    expect((fetch as any).mock.calls[0][0]).toContain("c=request_partner");
  });
});

describe("session helpers", () => {
  it("storeSession persists token/refresh/workspace; clearSession wipes everything", () => {
    storeSession("acme", "tok", "ref");
    localStorage.setItem(REFERRER_KEY, JSON.stringify({ code: "X" }));
    expect(getToken()).toBe("tok");

    clearSession();
    expect(getToken()).toBeNull();
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
    expect(getWorkspace()).toBeNull();
    expect(getReferrer()).toBeNull();
  });
});
