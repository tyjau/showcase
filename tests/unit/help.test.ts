import { describe, it, expect } from "vitest";
import {
  helpArticles,
  helpArticle,
  helpText,
  helpArticlesByCategory,
  HELP_CATEGORIES,
} from "@/lib/help";

describe("help center", () => {
  it("exposes a non-empty set of articles", () => {
    expect(helpArticles().length).toBeGreaterThan(0);
  });

  it("looks up an article by slug, null for an unknown one", () => {
    expect(helpArticle("premiers-pas")?.category).toBe("getting-started");
    expect(helpArticle("does-not-exist")).toBeNull();
  });

  it("helpText returns the requested language and falls back to English", () => {
    const a = helpArticle("premiers-pas")!;
    expect(helpText(a, "fr").title).toBe("Premiers pas avec SkyRH");
    expect(helpText(a, "en").title).toBe("Getting started with SkyRH");
    // Unknown language -> English fallback (never undefined).
    expect(helpText(a, "de").title).toBe(helpText(a, "en").title);
  });

  it("buckets every article under a known category, none lost", () => {
    const byCat = helpArticlesByCategory();
    const keys = Object.keys(byCat);
    expect(keys.sort()).toEqual([...HELP_CATEGORIES].sort());
    const counted = keys.reduce((n, k) => n + byCat[k as keyof typeof byCat].length, 0);
    expect(counted).toBe(helpArticles().length);
  });
});
