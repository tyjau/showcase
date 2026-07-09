// lib/seo.ts porte le contrat d'indexation : chaque page pose SES canonical/hreflang, sinon (bug
// SEO-01) elles héritent de l'accueil via le layout. On verrouille ici la forme des alternates :
// self-canonical par locale + une entrée hreflang par locale + un x-default vers la locale par défaut.
import { describe, it, expect } from "vitest";
import { buildAlternates, NOINDEX } from "@/lib/seo";

describe("buildAlternates", () => {
  it("pose un canonical propre à la page (locale + chemin), pas l'accueil", () => {
    expect(buildAlternates("fr", "/pricing").canonical).toBe("/fr/pricing");
    expect(buildAlternates("en", "/features/WAGE-GEN00").canonical).toBe(
      "/en/features/WAGE-GEN00",
    );
  });

  it("gère l'accueil (chemin vide) sans slash superflu", () => {
    expect(buildAlternates("en", "").canonical).toBe("/en");
    expect(buildAlternates("fr").canonical).toBe("/fr");
  });

  it("normalise un chemin sans slash de tête", () => {
    expect(buildAlternates("en", "pricing").canonical).toBe("/en/pricing");
  });

  it("émet une entrée hreflang par locale + un x-default vers la locale par défaut", () => {
    const langs = buildAlternates("fr", "/pricing").languages as Record<string, string>;
    expect(langs.en).toBe("/en/pricing");
    expect(langs.fr).toBe("/fr/pricing");
    expect(langs["x-default"]).toBe("/en/pricing");
  });

  it("le canonical ne dépend pas de la locale par défaut mais de la locale de la page", () => {
    // Une page /fr/... est canonique vers elle-même, jamais rabattue sur /en.
    expect(buildAlternates("fr", "/company").canonical).toBe("/fr/company");
  });
});

describe("NOINDEX", () => {
  it("exclut de l'index tout en suivant les liens", () => {
    expect(NOINDEX).toEqual({ index: false, follow: true });
  });
});
