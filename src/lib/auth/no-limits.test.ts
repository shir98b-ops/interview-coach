import { describe, expect, it } from "vitest";
import { hasNoLimits, parseEmailList } from "./no-limits";

describe("parseEmailList", () => {
  it("splits, trims and lowercases addresses", () => {
    expect(parseEmailList(" A@x.com, b@y.org ,,")).toEqual([
      "a@x.com",
      "b@y.org",
    ]);
  });
  it("is empty when the setting is missing", () => {
    expect(parseEmailList(undefined)).toEqual([]);
  });
});

describe("hasNoLimits", () => {
  it("frees a listed account in any letter case", () => {
    expect(hasNoLimits("Owner@Example.com", "owner@example.com")).toBe(true);
  });
  it("keeps limits for everyone else", () => {
    expect(hasNoLimits("friend@example.com", "owner@example.com")).toBe(false);
    expect(hasNoLimits(undefined, "owner@example.com")).toBe(false);
    expect(hasNoLimits("owner@example.com", undefined)).toBe(false);
  });
});
