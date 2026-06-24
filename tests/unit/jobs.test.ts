import { describe, it, expect } from "vitest";
import { teamsOf, filterJobs, type Job } from "@/lib/jobs";

const JOBS: Job[] = [
  { title: "A", team: "Engineering", location: "Paris", type: "CDI" },
  { title: "B", team: "Product", location: "Remote", type: "CDI" },
  { title: "C", team: "Engineering", location: "Remote", type: "CDI" },
  { title: "D", team: "Sales", location: "Paris", type: "CDI" },
];

describe("teamsOf", () => {
  it("returns unique teams in first-seen order", () => {
    expect(teamsOf(JOBS)).toEqual(["Engineering", "Product", "Sales"]);
  });
  it("is empty for no jobs", () => {
    expect(teamsOf([])).toEqual([]);
  });
});

describe("filterJobs", () => {
  it("returns all jobs when team is null", () => {
    expect(filterJobs(JOBS, null)).toHaveLength(4);
  });
  it("filters to a single team", () => {
    expect(filterJobs(JOBS, "Engineering").map((j) => j.title)).toEqual(["A", "C"]);
  });
  it("returns empty for an unknown team", () => {
    expect(filterJobs(JOBS, "Legal")).toEqual([]);
  });
});
