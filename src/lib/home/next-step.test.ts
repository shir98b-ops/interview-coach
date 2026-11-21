import { describe, expect, it } from "vitest";
import { nextStep, type HomeFacts } from "./next-step";

const base: HomeFacts = {
  hasResume: true,
  roleTitle: "PMO",
  roundsDone: new Set(["general", "technical", "design"]),
  technicalRole: false,
  codingRole: false,
  resumeScore: 80,
  openTakeHome: null,
  upcoming: null,
  lesson: { slug: "star", title: "שיטת STAR", minutes: 5 },
};
const key = (facts: Partial<HomeFacts>) => nextStep({ ...base, ...facts }).key;

describe("nextStep", () => {
  it("puts an upcoming interview first", () => {
    const step = nextStep({
      ...base,
      hasResume: false,
      upcoming: {
        jobId: "j1",
        company: "נובה",
        kindLabel: "ראיון מקצועי",
        days: 3,
        whenText: "שלישי 10:00",
        practicesForJob: 5,
      },
    });
    expect(step.key).toBe("interview");
    expect(step.tone).toBe("sun");
    expect(step.chip).toBe("ראיון בעוד 3 ימים");
    expect(step.prep).toEqual({ done: 3, total: 3 });
  });

  it("walks a new user through the three set-up steps", () => {
    expect(nextStep({ ...base, hasResume: false }).setup?.step).toBe(1);
    expect(nextStep({ ...base, roleTitle: null }).setup?.step).toBe(2);
    const intro = nextStep({ ...base, roundsDone: new Set() });
    expect(intro.setup?.step).toBe(3);
    expect(intro.href).toBe("/practice?mode=general");
  });

  it("suggests the professional round after the first interview", () => {
    expect(key({ roundsDone: new Set(["general"]) })).toBe("professional");
  });

  it("suggests a case round for non-technical roles", () => {
    expect(key({ roundsDone: new Set(["general", "technical"]) })).toBe("case");
  });

  it("suggests coding for roles that write code", () => {
    expect(
      key({
        roundsDone: new Set(["general", "technical"]),
        technicalRole: true,
        codingRole: true,
      }),
    ).toBe("technical");
  });

  it("then an open take-home, a weak resume and a lesson", () => {
    expect(key({ openTakeHome: { id: "t1" } })).toBe("take-home");
    expect(key({ resumeScore: 62 })).toBe("improve-resume");
    expect(key({})).toBe("lesson");
    expect(key({ lesson: null })).toBe("professional");
  });
});
