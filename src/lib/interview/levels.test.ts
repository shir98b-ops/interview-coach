import { describe, expect, it } from "vitest";
import { parseSeniority } from "@/lib/format";
import { levelLine } from "./levels";

describe("practice level", () => {
  it("keeps only the known levels", () => {
    expect(parseSeniority("Entry level")).toBe("Entry level");
    expect(parseSeniority("Manager")).toBe("Manager");
    expect(parseSeniority("")).toBeNull();
    expect(parseSeniority("Principal")).toBeNull();
    expect(parseSeniority(null)).toBeNull();
  });

  it("lets a chosen level win over the posting and resume", () => {
    expect(levelLine("Entry level")).toContain("Entry level");
    expect(levelLine("Entry level")).toContain("wins over");
  });

  it("reads the level from the posting, then the resume, when none is chosen", () => {
    const line = levelLine(null);
    expect(line).toContain("job posting");
    expect(line).toContain("resume");
  });
});
