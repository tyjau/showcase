import { describe, it, expect } from "vitest";
import { wrapIndex } from "@/lib/carousel";

describe("wrapIndex", () => {
  it("passes through in-range indices", () => {
    expect(wrapIndex(0, 3)).toBe(0);
    expect(wrapIndex(2, 3)).toBe(2);
  });

  it("wraps overflow (next from last → first)", () => {
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(4, 3)).toBe(1);
  });

  it("wraps negatives (prev from first → last)", () => {
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(-3, 3)).toBe(0);
  });

  it("is safe for empty/zero length", () => {
    expect(wrapIndex(2, 0)).toBe(0);
  });
});
