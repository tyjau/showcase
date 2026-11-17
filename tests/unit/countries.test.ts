import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchCountries } from "@/lib/catalog";
import { interpretCountriesPayload, FALLBACK_COUNTRY_NAMES } from "@/lib/countries";

function stubFetch(impl: () => Promise<unknown>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}
const okJson = (body: unknown) => async () => ({ ok: true, status: 200, json: async () => body });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchCountries — état « relu » par pays", () => {
  it("états mêlés : lit le champ additif par pays", async () => {
    stubFetch(okJson({ data: { countries: [
      { name: "France", lawRulesReadTwice: true },
      { name: "Togo", lawRulesReadTwice: false },
      { name: "Mali" },
    ] } }));
    const r = await fetchCountries();
    expect(r.status).toBe("ok");
    expect(r.countries).toEqual([
      { name: "France", reviewed: true },
      { name: "Togo", reviewed: false },
      { name: "Mali", reviewed: false },
    ]);
  });

  it("champ absent (ancien back) : tous « non relus », liste conservée", async () => {
    stubFetch(okJson({ data: { countries: [{ name: "France" }, { name: "Togo" }] } }));
    const r = await fetchCountries();
    expect(r.status).toBe("ok");
    expect(r.countries.map((c) => c.reviewed)).toEqual([false, false]);
    expect(r.countries.map((c) => c.name)).toEqual(["France", "Togo"]);
  });

  it("champ non booléen (« true », 1) : lecture défensive = non relu", async () => {
    stubFetch(okJson({ data: { countries: [
      { name: "A", lawRulesReadTwice: "true" }, { name: "B", lawRulesReadTwice: 1 }, { name: "C", lawRulesReadTwice: true },
    ] } }));
    const r = await fetchCountries();
    expect(r.countries.map((c) => c.reviewed)).toEqual([false, false, true]);
  });

  it("liste VIDE (200) : jamais la liste statique", async () => {
    stubFetch(okJson({ data: { countries: [] } }));
    const r = await fetchCountries();
    expect(r.status).toBe("empty");
    expect(r.countries).toEqual([]);
  });

  it("back en erreur (500) : liste statique, TOUS non relus, erreur journalisée", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(async () => ({ ok: false, status: 500, json: async () => ({}) }));
    const r = await fetchCountries();
    expect(r.status).toBe("degraded");
    expect(r.countries.map((c) => c.name)).toEqual(FALLBACK_COUNTRY_NAMES);
    expect(r.countries.every((c) => c.reviewed === false)).toBe(true);
    expect(err).toHaveBeenCalled();
  });

  it("back injoignable (fetch rejette) : même repli, journalisé", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(async () => { throw new Error("ECONNREFUSED"); });
    const r = await fetchCountries();
    expect(r.status).toBe("degraded");
    expect(r.countries.every((c) => !c.reviewed)).toBe(true);
    expect(err).toHaveBeenCalled();
  });

  it("réponse illisible (pas de data.countries) : repli dégradé, pas une liste vide", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(okJson({ data: {} }));
    const r = await fetchCountries();
    expect(r.status).toBe("degraded");
  });
});

describe("interpretCountriesPayload", () => {
  it("ignore les noms vides et les éléments non objets", () => {
    expect(interpretCountriesPayload({ data: { countries: [null, { name: " " }, { name: " Togo " }] } }))
      .toEqual([{ name: "Togo", reviewed: false }]);
  });
  it("renvoie null quand la forme est illisible", () => {
    expect(interpretCountriesPayload(null)).toBeNull();
    expect(interpretCountriesPayload({ data: { countries: "x" } })).toBeNull();
  });
});
