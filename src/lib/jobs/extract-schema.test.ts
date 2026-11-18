import { describe, expect, it } from "vitest";
import { firstLink, readExtractedJob, validatePaste } from "./extract-schema";

describe("validatePaste", () => {
  it("recognizes a pasted link", () => {
    expect(validatePaste(" https://jobs.example.com/1 ")).toEqual({
      ok: true,
      kind: "link",
      link: "https://jobs.example.com/1",
    });
  });

  it("rejects empty and very short text", () => {
    expect(validatePaste("").ok).toBe(false);
    expect(validatePaste("Product Manager at Wix").ok).toBe(false);
  });

  it("accepts a pasted page", () => {
    expect(validatePaste("About the job ".repeat(20)).ok).toBe(true);
  });
});

describe("readExtractedJob", () => {
  const job = {
    isJobPosting: true,
    company: "Monday",
    title: "Product Manager",
    link: "linkedin.com/jobs/view/1",
    description: "We are looking for a product manager to lead payments.",
  };

  it("cleans a job and makes the link safe", () => {
    expect(readExtractedJob(job)?.link).toBe(
      "https://linkedin.com/jobs/view/1",
    );
  });

  it("rejects pages that are not job postings or lack details", () => {
    expect(readExtractedJob({ ...job, isJobPosting: false })).toBeNull();
    expect(readExtractedJob({ ...job, company: " " })).toBeNull();
    expect(readExtractedJob({ ...job, description: "short" })).toBeNull();
  });

  it("drops unsafe links", () => {
    expect(readExtractedJob({ ...job, link: "javascript:x" })?.link).toBeNull();
  });
});

describe("firstLink", () => {
  it("finds the first web link in a page", () => {
    expect(firstLink("Apply at https://jobs.example.com/1 today")).toBe(
      "https://jobs.example.com/1",
    );
    expect(firstLink("no links")).toBeNull();
  });
});
