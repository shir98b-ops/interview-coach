import { describe, expect, it } from "vitest";
import { MAX_RESUME_BYTES, splitList, validateResumeFile } from "./schema";

const pdf = (size: number, name = "cv.pdf", type = "application/pdf") =>
  new File([new Uint8Array(size)], name, { type });

describe("validateResumeFile", () => {
  it("accepts a PDF under the size limit", () => {
    expect(validateResumeFile(pdf(1000)).ok).toBe(true);
  });

  it("rejects a missing or empty file", () => {
    expect(validateResumeFile(null).ok).toBe(false);
    expect(validateResumeFile(pdf(0)).ok).toBe(false);
  });

  it("rejects other file types", () => {
    expect(
      validateResumeFile(pdf(1000, "cv.docx", "application/msword")).ok,
    ).toBe(false);
  });

  it("rejects files over the limit", () => {
    expect(validateResumeFile(pdf(MAX_RESUME_BYTES + 1)).ok).toBe(false);
  });
});

describe("splitList", () => {
  it("splits on commas and new lines and drops blanks", () => {
    expect(splitList("SQL, Excel,\n Jira ,,")).toEqual([
      "SQL",
      "Excel",
      "Jira",
    ]);
  });
});
