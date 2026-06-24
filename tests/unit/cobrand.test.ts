import { describe, it, expect } from "vitest";
import { isHexColor, isHttpUrl } from "@/lib/cobrand";

describe("isHexColor", () => {
  it("accepts #RRGGBB", () => {
    expect(isHexColor("#0F9ED5")).toBe(true);
    expect(isHexColor("#0f9ed5")).toBe(true);
  });
  it("rejects 3-digit shorthand (guardian only allows 6)", () => {
    expect(isHexColor("#abc")).toBe(false);
  });
  it("rejects garbage / non-strings", () => {
    expect(isHexColor("red")).toBe(false);
    expect(isHexColor("0F9ED5")).toBe(false);
    expect(isHexColor(null)).toBe(false);
    expect(isHexColor(undefined)).toBe(false);
  });
});

describe("isHttpUrl", () => {
  it("accepts http(s) URLs", () => {
    expect(isHttpUrl("https://acme.test/logo.png")).toBe(true);
    expect(isHttpUrl("http://x.io/a.svg")).toBe(true);
  });
  it("rejects non-http schemes, empty, oversized", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:image/svg+xml,<svg>")).toBe(false);
    expect(isHttpUrl("/relative/path.png")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
    expect(isHttpUrl("https://x.io/" + "a".repeat(2050))).toBe(false);
    expect(isHttpUrl(null)).toBe(false);
  });
});
