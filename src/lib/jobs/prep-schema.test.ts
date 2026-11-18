import { describe, expect, it } from "vitest";
import { readPrepPlan, timeframe, validateDescription } from "./prep-schema";

const plan = {
  summary: "תפקיד מוצר עם דגש על נתונים.",
  requirements: [
    { requirement: "SQL", match: "partial", note: "הזכר את הדוחות" },
  ],
  likelyQuestions: [{ question: "ספר על מוצר", why: "בסיס", tip: "קצר" }],
  stories: [{ title: "השקה", fromResume: "Wix", shows: "הובלה" }],
  questionsToAsk: ["איך נמדדת הצלחה?"],
  research: ["המוצר המרכזי"],
  schedule: [{ when: "היום", task: "לקרוא את המודעה", minutes: 2 }],
};

describe("validateDescription", () => {
  it("clears the description when empty", () => {
    expect(validateDescription("  ")).toEqual({ ok: true, text: null });
  });

  it("rejects a posting that is too short", () => {
    expect(validateDescription("Product manager").ok).toBe(false);
  });

  it("accepts a full posting", () => {
    expect(validateDescription("x".repeat(200)).ok).toBe(true);
  });
});

describe("readPrepPlan", () => {
  it("reads a plan and keeps minutes in range", () => {
    expect(readPrepPlan(plan)?.schedule[0].minutes).toBe(5);
  });

  it("rejects a plan without questions", () => {
    expect(readPrepPlan({ ...plan, likelyQuestions: [] })).toBeNull();
    expect(readPrepPlan(null)).toBeNull();
  });
});

describe("timeframe", () => {
  it("fits the schedule to the time left", () => {
    expect(timeframe(null)).toContain("No interview");
    expect(timeframe(0)).toContain("today");
    expect(timeframe(1)).toContain("tomorrow");
    expect(timeframe(4)).toContain("4 days");
  });
});
