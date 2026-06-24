import { describe, it, expect } from "vitest";
import { addedRate, stagedTotal, stagedDelta, type Addon } from "@/lib/plan-staging";

const ADDONS: Addon[] = [
  { code: "RECR", label: "Recruitment", rate: 2.5 },
  { code: "PERF", label: "Performance", rate: 2 },
  { code: "SST", label: "Health & safety", rate: 1.5 },
];

describe("plan staging", () => {
  it("addedRate sums only selected add-ons", () => {
    expect(addedRate(ADDONS, new Set())).toBe(0);
    expect(addedRate(ADDONS, new Set(["RECR", "SST"]))).toBe(4);
  });

  it("stagedTotal = current + addedRate × seats", () => {
    // current 175 (€7 × 25), add RECR (+2.5/seat) over 25 seats → +62.5
    expect(stagedTotal(175, ADDONS, new Set(["RECR"]), 25)).toBe(237.5);
  });

  it("stagedDelta is 0 with nothing staged, positive otherwise", () => {
    expect(stagedDelta(175, ADDONS, new Set(), 25)).toBe(0);
    expect(stagedDelta(175, ADDONS, new Set(["PERF"]), 25)).toBe(50);
  });
});
