import { describe, expect, it } from "vitest";
import { checkJobLink, htmlToText } from "./fetch-page";

describe("checkJobLink", () => {
  it("accepts public career pages", () => {
    const result = checkJobLink("jobs.example.com/pm");
    expect(result.ok && result.url.toString()).toBe(
      "https://jobs.example.com/pm",
    );
  });

  it("sends LinkedIn links back to pasting", () => {
    expect(checkJobLink("https://www.linkedin.com/jobs/view/1")).toEqual({
      ok: false,
      reason: "linkedin",
    });
    expect(checkJobLink("https://lnkd.in/abc").ok).toBe(false);
  });

  it("blocks internal addresses", () => {
    for (const link of [
      "http://127.0.0.1/x",
      "http://169.254.169.254/latest",
      "http://localhost:3000",
      "https://db.internal/x",
      "https://example.com:8080/x",
    ]) {
      expect(checkJobLink(link).ok).toBe(false);
    }
  });
});

describe("htmlToText", () => {
  it("keeps the text and drops scripts and tags", () => {
    expect(
      htmlToText(
        "<head><title>x</title></head><script>bad()</script><h1>PM</h1><p>Lead &amp; ship</p>",
      ),
    ).toBe("PM\nLead & ship");
  });
});
