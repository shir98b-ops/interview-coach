import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { describeKey } = await import("./extract");

describe("describeKey", () => {
  it("reports a well-formed key without revealing it", () => {
    const text = describeKey("sk-ant-api03-" + "x".repeat(95));
    expect(text).toBe("key starts correctly, 108 characters");
    expect(text).not.toContain("xxx");
  });

  it("shows the start of a wrong value and hidden characters", () => {
    expect(describeKey("‏ANTHROPIC_API_KEY")).toBe(
      'key starts with "ANTHRO", 17 characters, 1 hidden removed',
    );
  });
});
