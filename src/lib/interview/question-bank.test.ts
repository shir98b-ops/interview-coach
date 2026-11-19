import { describe, expect, it } from "vitest";
import {
  PREVIOUS_QUESTION_LIMIT,
  bankFor,
  behavioralThemes,
  commonQuestions,
  focusAreasFor,
  isCodingRole,
  isTechnicalRole,
  matchRoleFamilies,
  previousQuestionList,
  sampleBank,
  systemDesignProblems,
  technicalTopics,
} from "./question-bank";

const ids = (title: string) => matchRoleFamilies(title).map((f) => f.id);

describe("matchRoleFamilies", () => {
  it("matches whole words in the role title", () => {
    expect(ids("Junior Product Manager")).toEqual(["product"]);
    expect(ids("Head of Marketing")).toEqual(["marketing", "management"]);
    expect(ids("Data Analyst")).toEqual(["data"]);
    expect(ids("Customer Success Specialist")).toEqual(["sales"]);
  });

  it("does not match parts of words", () => {
    // "pr" (public relations) must not match "product" or "project".
    expect(ids("Project Coordinator")).toEqual(["project"]);
  });

  it("matches Hebrew role titles, with prefixes and feminine forms", () => {
    expect(ids("מנהלת מוצר")).toEqual(["product"]);
    expect(ids("מנהל פרויקטים")).toEqual(["project"]);
    expect(ids("אנליסטית נתונים")).toEqual(["data"]);
    expect(ids("מנהלת השיווק")).toEqual(["marketing"]);
    expect(ids("נציג שירות לקוחות")).toEqual(["sales"]);
    expect(ids("מגייסת")).toEqual(["people"]);
    expect(ids("מעצבת UX")).toEqual(["design"]);
    expect(ids("רואה חשבון")).toEqual(["finance"]);
    expect(ids('סמנכ"ל כספים')).toEqual(["finance", "management"]);
    expect(ids("ראש צוות פיתוח")).toEqual(["engineering", "management"]);
  });

  it("does not match Hebrew words inside longer words", () => {
    // "חשב" (comptroller) must not match "מחשבים" (computers).
    expect(ids("טכנאי מחשבים")).toEqual([]);
    // "תוכן" (content) is not "תוכנה" (software).
    expect(ids("מפתחת תוכנה")).toEqual(["engineering"]);
  });

  it("keeps engineers outside software out of the software questions", () => {
    expect(ids("Electrical Engineer")).toEqual(["hardware"]);
    expect(ids("Civil Engineer")).toEqual(["hardware"]);
    expect(ids("מהנדס חשמל")).toEqual(["hardware"]);
    expect(ids("מהנדסת בניין")).toEqual(["hardware"]);
    expect(ids("מהנדס תעשייה וניהול")).toEqual(["hardware"]);
    expect(ids("Software Engineer")).toEqual(["engineering"]);
    expect(ids("מהנדס תוכנה")).toEqual(["engineering"]);
    expect(ids("Engineer")).toEqual(["engineering"]);
  });

  it("matches the professions added for social work, education, health and more", () => {
    expect(ids("עובדת סוציאלית")).toEqual(["social"]);
    expect(ids("עו״ס")).toEqual(["social"]);
    expect(ids("Social Worker")).toEqual(["social"]);
    expect(ids("מחנכת כיתה ו")).toEqual(["education"]);
    expect(ids("High School Teacher")).toEqual(["education"]);
    expect(ids("אחות מוסמכת")).toEqual(["health"]);
    expect(ids("Registered Nurse")).toEqual(["health"]);
    expect(ids("עורכת דין")).toEqual(["legal"]);
    expect(ids('עו"ד מסחרי')).toEqual(["legal"]);
    expect(ids("מלצרית")).toEqual(["service"]);
    expect(ids("עובד עירייה")).toEqual(["public"]);
    expect(ids("Security Engineer")).toEqual(["engineering", "security"]);
    expect(ids("מנהלת משרד")).toEqual(["admin"]);
  });

  it("does not take public relations for the public sector", () => {
    expect(ids("יחסי ציבור")).toEqual(["marketing"]);
  });

  it("treats business developers as sales, not software", () => {
    expect(ids("Business Developer")).toEqual(["sales"]);
    expect(ids("מפתח עסקי")).toEqual(["sales"]);
  });

  it("matches plural and -er forms in English", () => {
    expect(ids("Product Designer")).toEqual(["product", "design"]);
    expect(ids("Recruiter")).toEqual(["people"]);
  });

  it("returns nothing for an unknown role", () => {
    expect(ids("Juggler")).toEqual([]);
  });
});

describe("focusAreasFor", () => {
  it("gives the professional topics of the field, with Israeli anchors", () => {
    expect(focusAreasFor("עובדת סוציאלית").join(" ")).toMatch(/Youth Law/);
    expect(focusAreasFor("עורך דין").join(" ")).toMatch(/Privacy Protection/);
  });

  it("is empty for a role with no field topics", () => {
    expect(focusAreasFor("Juggler")).toEqual([]);
  });
});

describe("bankFor", () => {
  it("always includes the common questions", () => {
    expect(bankFor("Juggler")).toEqual(commonQuestions);
    expect(bankFor("Data Analyst").length).toBeGreaterThan(
      commonQuestions.length,
    );
  });

  it("adds management questions for the Manager level", () => {
    expect(bankFor("Juggler", "Manager")).toContain(
      "How do you set goals for your team?",
    );
  });
});

describe("sampleBank", () => {
  const bank = ["a", "b", "c", "d", "e"];

  it("returns the requested number of distinct questions from the bank", () => {
    const sample = sampleBank(bank, 3);
    expect(sample).toHaveLength(3);
    expect(new Set(sample).size).toBe(3);
    for (const q of sample) expect(bank).toContain(q);
  });

  it("changes order with the random source", () => {
    const first = sampleBank(bank, 5, () => 0);
    const second = sampleBank(bank, 5, () => 0.99);
    expect(first).not.toEqual(second);
  });

  it("does not change the bank itself", () => {
    sampleBank(bank, 2);
    expect(bank).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("previousQuestionList", () => {
  it("drops blanks and repeats, ignoring case and spacing", () => {
    expect(
      previousQuestionList([
        "Tell me about yourself.",
        "  tell me   about yourself. ",
        "",
        "Why this role?",
      ]),
    ).toEqual(["Tell me about yourself.", "Why this role?"]);
  });

  it("keeps at most the limit", () => {
    const many = Array.from(
      { length: PREVIOUS_QUESTION_LIMIT + 10 },
      (_, i) => `Question ${i}`,
    );
    expect(previousQuestionList(many)).toHaveLength(PREVIOUS_QUESTION_LIMIT);
  });
});

describe("isTechnicalRole", () => {
  it("is true for software roles", () => {
    expect(isTechnicalRole("Backend Developer")).toBe(true);
    expect(isTechnicalRole("Senior Software Engineer")).toBe(true);
    expect(isTechnicalRole("Data Engineer")).toBe(true);
  });
  it("is false for other roles", () => {
    expect(isTechnicalRole("Account Executive")).toBe(false);
    expect(isTechnicalRole("HR Business Partner")).toBe(false);
    expect(isTechnicalRole("Data Analyst")).toBe(false);
    expect(isTechnicalRole("Electrical Engineer")).toBe(false);
    expect(isTechnicalRole("Social Worker")).toBe(false);
  });
});

describe("behavioralThemes", () => {
  it("has enough distinct themes to vary many interviews", () => {
    expect(new Set(behavioralThemes).size).toBe(behavioralThemes.length);
    expect(behavioralThemes.length).toBeGreaterThanOrEqual(12);
  });
});

describe("technical banks", () => {
  it("have enough distinct entries to vary practice", () => {
    for (const list of [systemDesignProblems, technicalTopics]) {
      expect(new Set(list).size).toBe(list.length);
      expect(list.length).toBeGreaterThanOrEqual(15);
    }
  });
});

describe("isCodingRole", () => {
  it("includes software and data roles, in English and Hebrew", () => {
    expect(isCodingRole("Backend Developer")).toBe(true);
    expect(isCodingRole("Data Analyst")).toBe(true);
    expect(isCodingRole("מפתח תוכנה")).toBe(true);
    expect(isCodingRole("אנליסטית נתונים")).toBe(true);
    expect(isCodingRole("עובדת סוציאלית")).toBe(false);
    expect(isCodingRole("Electrical Engineer")).toBe(false);
  });

  it("treats Hebrew software titles as technical", () => {
    expect(isTechnicalRole("מפתחת Full Stack")).toBe(true);
    expect(isTechnicalRole("מנהל מוצר")).toBe(false);
    expect(isTechnicalRole("Business Developer")).toBe(false);
    expect(isTechnicalRole("מפתח עסקי")).toBe(false);
  });
});
