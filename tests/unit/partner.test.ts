import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchPartnerConfig } from "@/lib/partner";

function res(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

describe("fetchPartnerConfig", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null for an empty code without hitting the network", async () => {
    expect(await fetchPartnerConfig("")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns the partner config on success and url-encodes the code", async () => {
    const data = { code: "ac me", brand_name: "Acme", primary_color: "#2563eb" };
    (fetch as any).mockResolvedValue(res({ meta: { code: 200 }, data }));
    const cfg = await fetchPartnerConfig("ac me");
    expect(cfg).toEqual(data);
    const url = (fetch as any).mock.calls[0][0] as string;
    expect(url).toContain("c=partner_config");
    expect(url).toContain("code=ac%20me");
  });

  it("returns null on a 404 meta code", async () => {
    (fetch as any).mockResolvedValue(res({ meta: { code: 404 } }, true, 200));
    expect(await fetchPartnerConfig("nope")).toBeNull();
  });

  it("returns null when the response carries no data", async () => {
    (fetch as any).mockResolvedValue(res({ meta: { code: 200 } }));
    expect(await fetchPartnerConfig("acme")).toBeNull();
  });

  it("returns null on a network throw", async () => {
    (fetch as any).mockRejectedValue(new Error("boom"));
    expect(await fetchPartnerConfig("acme")).toBeNull();
  });
});
