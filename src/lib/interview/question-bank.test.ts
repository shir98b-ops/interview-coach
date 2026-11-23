import { describe, expect, it } from "vitest";
import {
  PREVIOUS_QUESTION_LIMIT,
  bankFor,
  behavioralThemes,
  commonQuestions,
  designProblemFor,
  engineeringDesignProblemFor,
  engineeringSpecialties,
  engineeringSpecialtyFor,
  engineeringTopicsFor,
  hasDesignRound,
  hdlDesignTopics,
  hdlTopicsFor,
  hdlVerificationTopics,
  focusAreasFor,
  isCodingRole,
  isTechnicalRole,
  matchRoleFamilies,
  previousQuestionList,
  sampleBank,
  systemDesignProblems,
  techSpecialtyFor,
  technicalTopics,
  technicalTopicsFor,
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
    expect(ids("מהנדס מוצר")).toEqual(["hardware"]);
    expect(ids("מהנדסת מוצר בכירה")).toEqual(["hardware"]);
    expect(ids("מנהל מוצר")).toEqual(["product"]);
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

describe("role matching for titles that used to miss", () => {
  it("does not treat analysts or marketers as developers", () => {
    expect(isTechnicalRole("Web Analyst")).toBe(false);
    expect(isTechnicalRole("Marketing Automation Manager")).toBe(false);
    expect(isTechnicalRole("Platform Product Manager")).toBe(false);
  });

  it("recognizes software specialties and engineering leadership", () => {
    expect(isTechnicalRole("Embedded Software Engineer")).toBe(true);
    expect(isTechnicalRole("Firmware Engineer")).toBe(true);
    expect(isTechnicalRole("Data Scientist")).toBe(true);
    expect(isTechnicalRole("Cloud Engineer")).toBe(true);
    expect(isTechnicalRole("מפתחת אלגוריתמים")).toBe(true);
    expect(ids("Engineering Manager")).toContain("management");
  });

  it("gives common titles a profession", () => {
    expect(ids("IT Support")).toEqual(["it"]);
    expect(ids("Strategy Consultant")).toContain("consulting");
    expect(ids("יועץ אסטרטגי")).toContain("consulting");
    expect(ids("יועצת חינוכית")).not.toContain("consulting");
    expect(ids("CFO")).toContain("finance");
    expect(ids("מבקר פנים")).toContain("finance");
    expect(ids("HRBP")).toContain("people");
    expect(ids("מרפאה בעיסוק")).toContain("health");
    expect(ids("קניין")).toContain("project");
  });

  it("gives the core business roles focus areas", () => {
    for (const title of [
      "Product Manager",
      "Data Analyst",
      "Marketing Manager",
      "SDR",
      "UX Designer",
    ]) {
      expect(focusAreasFor(title).length).toBeGreaterThan(4);
    }
  });
});

describe("software specialties", () => {
  it("matches a title to its specialty", () => {
    expect(techSpecialtyFor("Senior Frontend Developer")?.id).toBe("frontend");
    expect(techSpecialtyFor("iOS Developer")?.id).toBe("mobile");
    expect(techSpecialtyFor("DevOps Engineer")?.id).toBe("devops");
    expect(techSpecialtyFor("QA Automation Engineer")?.id).toBe("qa");
    expect(techSpecialtyFor("Data Engineer")?.id).toBe("data");
    expect(techSpecialtyFor("ML Engineer")?.id).toBe("ml");
    expect(techSpecialtyFor("Embedded Software Engineer")?.id).toBe("embedded");
    expect(techSpecialtyFor("Backend Developer")).toBeNull();
  });

  it("draws most topics from the specialty and one fundamental", () => {
    const topics = technicalTopicsFor("Frontend Developer", 5, () => 0);
    expect(topics).toHaveLength(5);
    const frontend = techSpecialtyFor("Frontend Developer")!.topics;
    expect(topics.filter((t) => frontend.includes(t))).toHaveLength(4);
    expect(technicalTopics).toContain(topics[4]);
  });

  it("picks a design problem of the specialty", () => {
    const mobile = techSpecialtyFor("Android Developer")!.designProblems;
    expect(mobile).toContain(designProblemFor("Android Developer"));
    expect(systemDesignProblems).toContain(
      designProblemFor("Backend Developer"),
    );
  });
});

describe("electrical specialties", () => {
  const cases: [string, string | null][] = [
    ["Design Verification Engineer", "verification"],
    ["מהנדס אימות שבבים", "verification"],
    ["FPGA Engineer", "fpga"],
    ["RTL Design Engineer", "chip"],
    ["Physical Design Engineer", "chip"],
    ["מהנדסת תכנון לוגי", "chip"],
    ["RF Engineer", "rf"],
    ["Analog Design Engineer", "analog"],
    ["Power Electronics Engineer", "analog"],
    ["Hardware Engineer", "board"],
    ["PCB Layout Engineer", "board"],
    ["מהנדס חומרה", "board"],
    ["Power Systems Engineer", "power"],
    ["מתכנן חשמל", "power"],
    ["מהנדס מתח גבוה", "power"],
    ["Electrical Engineer", "electrical"],
    ["מהנדס חשמל", "electrical"],
    ["מהנדסת אלקטרוניקה", "electrical"],
    // Not electrical engineering.
    ["חשמלאי", null],
    ["Embedded Software Engineer", null],
    ["Backend Developer", null],
    ["SOC Analyst", null],
    ["Product Designer", null],
    ["Mechanical Engineer", null],
  ];
  it.each(cases)("%s → %s", (title, id) => {
    expect(engineeringSpecialtyFor(title)?.id ?? null).toBe(id);
  });

  it("puts every electrical title in the engineering family, not software", () => {
    for (const title of [
      "Design Verification Engineer",
      "RTL Design Engineer",
      "PCB Layout Engineer",
      "Analog Design Engineer",
      "Power Systems Engineer",
      "מהנדס אימות שבבים",
    ]) {
      expect(matchRoleFamilies(title).map((f) => f.id)).toEqual(["hardware"]);
    }
  });

  it("gives chip, verification and FPGA roles a coding round only", () => {
    expect(isCodingRole("Design Verification Engineer")).toBe(true);
    expect(isCodingRole("FPGA Engineer")).toBe(true);
    expect(isCodingRole("ASIC Design Engineer")).toBe(true);
    expect(isCodingRole("RF Engineer")).toBe(false);
    expect(isCodingRole("Power Systems Engineer")).toBe(false);
  });

  it("gives electrical roles a design round but keeps them off software rounds", () => {
    expect(hasDesignRound("Electrical Engineer")).toBe(true);
    expect(hasDesignRound("FPGA Engineer")).toBe(true);
    expect(isTechnicalRole("FPGA Engineer")).toBe(false);
    expect(hasDesignRound("Mechanical Engineer")).toBe(false);
  });

  it("draws most topics from the specialty, plus one general engineering topic", () => {
    const topics = engineeringTopicsFor("RF Engineer", 5, () => 0.3);
    const rf = engineeringSpecialties.find((s) => s.id === "rf")!;
    expect(topics).toHaveLength(5);
    expect(topics.filter((t) => rf.topics.includes(t))).toHaveLength(4);
    expect(engineeringTopicsFor("Marketing Manager", 5)).toEqual([]);
  });

  it("picks a design problem from the specialty", () => {
    const fpga = engineeringSpecialties.find((s) => s.id === "fpga")!;
    expect(fpga.designProblems).toContain(
      engineeringDesignProblemFor("FPGA Engineer", () => 0.5),
    );
    expect(engineeringDesignProblemFor("Sales Manager")).toBeNull();
  });

  it("has full topic and problem lists for every specialty", () => {
    for (const s of engineeringSpecialties) {
      expect(s.topics.length).toBeGreaterThanOrEqual(8);
      expect(s.designProblems.length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("titles that used to fall between the chairs", () => {
  it.each([
    ["Systems Engineer", "systems"],
    ["מהנדס מערכת", "systems"],
    ["Robotics Engineer", "robotics"],
    ["מהנדסת מכטרוניקה", "robotics"],
    ["Optical Engineer", "optics"],
    ["מהנדס אופטיקה", "optics"],
    ["Reliability Engineer", "reliability"],
    ["מהנדסת איכות", "reliability"],
  ])("%s gets the %s engineering specialty, not software", (title, id) => {
    expect(engineeringSpecialtyFor(title)?.id).toBe(id);
    expect(matchRoleFamilies(title).map((f) => f.id)).toEqual(["hardware"]);
    expect(hasDesignRound(title)).toBe(true);
    expect(isCodingRole(title)).toBe(false);
  });

  it("treats LLM and game roles as software specialties", () => {
    expect(isTechnicalRole("LLM Engineer")).toBe(true);
    expect(techSpecialtyFor("LLM Engineer")?.id).toBe("llm");
    expect(techSpecialtyFor("Game Developer")?.id).toBe("game");
    expect(isTechnicalRole("Smart Contract Engineer")).toBe(true);
  });

  it("sends researchers to the right field", () => {
    expect(matchRoleFamilies("Security Researcher").map((f) => f.id)).toEqual([
      "security",
    ]);
    expect(matchRoleFamilies("UX Researcher").map((f) => f.id)).toEqual([
      "design",
    ]);
    expect(matchRoleFamilies("Quant Researcher").map((f) => f.id)).toEqual([
      "finance",
    ]);
  });

  it("keeps a penetration tester out of software testing", () => {
    expect(techSpecialtyFor("Penetration Tester")).toBeNull();
    expect(matchRoleFamilies("Penetration Tester").map((f) => f.id)).toEqual([
      "security",
    ]);
    expect(techSpecialtyFor("QA Tester")?.id).toBe("qa");
  });

  it("gives hybrid technical roles their own tracks", () => {
    expect(matchRoleFamilies("Solutions Engineer").map((f) => f.id)).toEqual([
      "solutions",
    ]);
    expect(matchRoleFamilies("Pre-Sales Engineer").map((f) => f.id)).toContain(
      "solutions",
    );
    expect(
      matchRoleFamilies("Technical Support Engineer").map((f) => f.id),
    ).toEqual(["it"]);
    expect(matchRoleFamilies("תומך טכני").map((f) => f.id)).toEqual(["it"]);
    expect(matchRoleFamilies("DBA").map((f) => f.id)).toEqual(["it"]);
    expect(matchRoleFamilies("CTO").map((f) => f.id)).toEqual(["management"]);
  });

  it("treats a Hebrew test engineer as software QA", () => {
    expect(isTechnicalRole("מהנדס בדיקות")).toBe(true);
    expect(techSpecialtyFor("מהנדס בדיקות")?.id).toBe("qa");
  });
});

describe("RTL coding problems", () => {
  it("gives verification engineers verification problems, and designers design problems", () => {
    expect(hdlTopicsFor("Design Verification Engineer")).toBe(
      hdlVerificationTopics,
    );
    expect(hdlTopicsFor("מהנדס אימות שבבים")).toBe(hdlVerificationTopics);
    expect(hdlTopicsFor("FPGA Engineer")).toBe(hdlDesignTopics);
    expect(hdlTopicsFor("ASIC Design Engineer")).toBe(hdlDesignTopics);
  });
});
