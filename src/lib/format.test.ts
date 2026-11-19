import { describe, expect, it } from "vitest";
import {
  durationLabel,
  formatDate,
  localizeSeniority,
  seniorityLabel,
} from "./format";

describe("formatDate", () => {
  it("uses the Israel date, not the server's UTC date", () => {
    // 23:30 in Israel on November 18 is 21:30 UTC.
    expect(formatDate("2026-11-18T21:30:00Z")).toBe("18.11.2026");
    // 00:30 in Israel on November 19 is still November 18 in UTC.
    expect(formatDate("2026-11-18T22:30:00Z")).toBe("19.11.2026");
  });
});

describe("durationLabel", () => {
  it("says hours in words", () => {
    expect(durationLabel(45)).toBe("45 דקות");
    expect(durationLabel(60)).toBe("שעה");
    expect(durationLabel(90)).toBe("שעה וחצי");
    expect(durationLabel(120)).toBe("שעתיים");
    expect(durationLabel(180)).toBe("3 שעות");
    expect(durationLabel(150)).toBe("2 שעות ו־30 דקות");
  });
});

describe("seniority", () => {
  it("shows the Hebrew label", () => {
    expect(seniorityLabel("Mid level")).toBe("ביניים");
    expect(seniorityLabel("Something else")).toBe("Something else");
  });

  it("translates the level inside a saved title", () => {
    expect(localizeSeniority("Backend Developer (Senior)")).toBe(
      "Backend Developer (בכיר)",
    );
    expect(localizeSeniority("מנהל מוצר")).toBe("מנהל מוצר");
  });
});
