import { describe, expect, it } from "vitest";
import { isProtectedPath, safeNextPath } from "./redirect";

describe("isProtectedPath", () => {
  it("protects the dashboard and its sub-pages", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/dashboard/history")).toBe(true);
    expect(isProtectedPath("/profile")).toBe(true);
    expect(isProtectedPath("/practice/abc")).toBe(true);
  });

  it("leaves public pages open", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/dashboards")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("keeps paths inside the app", () => {
    expect(safeNextPath("/dashboard/history")).toBe("/dashboard/history");
  });

  it("falls back to the dashboard for missing or external targets", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
  });
});
