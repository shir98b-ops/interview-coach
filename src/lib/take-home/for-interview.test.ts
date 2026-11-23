import { describe, expect, it } from "vitest";
import { stageReviewsTakeHome, submittedTakeHome } from "./for-interview";

const brief = {
  title: "Rate limiter",
  company: "Acme, an API platform",
  context: "We get 10,000 requests a second.",
  tasks: ["Design the limiter", "Write tests"],
  deliverable: "Code and a README",
  format: "code",
  starterCode: "def allow(user_id): ...",
};
const feedback = {
  understanding: 4,
  solution: 3,
  structure: 4,
  actionability: 2,
  strengths: "Clear code.",
  improvements: ["No handling of clock skew"],
  interviewQuestions: ["How would this work across 10 servers?"],
};

describe("submittedTakeHome", () => {
  it("builds the prompt material from a reviewed submission", () => {
    const result = submittedTakeHome({
      brief,
      submission: " def allow(user_id): return True ",
      feedback,
    });
    expect(result?.title).toBe("Rate limiter");
    expect(result?.brief).toContain("1. Design the limiter");
    expect(result?.brief).toContain("Starter code:");
    expect(result?.submission).toBe("def allow(user_id): return True");
    expect(result?.weaknesses).toEqual(["No handling of clock skew"]);
    expect(result?.interviewQuestions).toHaveLength(1);
  });

  it("returns null before the take-home was submitted and reviewed", () => {
    expect(submittedTakeHome({ brief, submission: null, feedback })).toBeNull();
    expect(
      submittedTakeHome({ brief, submission: "my answer", feedback: null }),
    ).toBeNull();
  });
});

describe("stageReviewsTakeHome", () => {
  it("uses the take-home in work interviews, not in screens", () => {
    expect(stageReviewsTakeHome("professional")).toBe(true);
    expect(stageReviewsTakeHome(null)).toBe(true);
    expect(stageReviewsTakeHome("hr")).toBe(false);
    expect(stageReviewsTakeHome("screen")).toBe(false);
  });
});
