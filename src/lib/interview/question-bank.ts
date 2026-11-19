/**
 * Questions that interviewers commonly ask, grouped by kind of role. The
 * AI uses them as a base and tailors them to the candidate, so practice
 * stays close to what real interviews sound like.
 */

export interface RoleFamily {
  id: string;
  label: string;
  /** Words in a role title that point to this family. */
  keywords: string[];
  /**
   * Hebrew words, as regular expression sources (Latin terms such as "UX" are
   * already found by the keywords). Each must be a whole word,
   * optionally after the prefix letters ו or ה, so list plural and feminine
   * forms in the pattern itself.
   */
  hebrew?: string[];
  questions: string[];
}

/** Asked in almost every interview, whatever the role. */
export const commonQuestions = [
  "Tell me about yourself.",
  "Why are you interested in this role?",
  "Why do you want to leave your current job?",
  "What are your greatest strengths?",
  "What is a weakness you are working on?",
  "Tell me about a time you failed. What did you learn?",
  "Tell me about a time you disagreed with a colleague or manager. How did you handle it?",
  "Tell me about a time you had to deliver under a tight deadline.",
  "Describe a time you had to juggle several priorities. How did you decide what to do first?",
  "Tell me about a time you received difficult feedback. What did you do with it?",
  "Tell me about a time you made a mistake. How did you fix it?",
  "Describe a time you influenced someone without having authority over them.",
  "Tell me about the achievement you are most proud of.",
  "Where do you see yourself in a few years?",
];

export const roleFamilies: RoleFamily[] = [
  {
    id: "product",
    label: "Product",
    keywords: ["product", "pm", "owner"],
    hebrew: ["מוצר(ים)?", "פרודקט"],
    questions: [
      "What is a product you love, and how would you improve it?",
      "How do you decide what goes into the next release?",
      "Tell me about a feature you launched. How did you measure its success?",
      "How do you say no to a stakeholder's request?",
      "A key metric dropped 20% this week. How do you investigate?",
      "How do you work with engineers and designers when you disagree on a solution?",
    ],
  },
  {
    id: "project",
    label: "Project and operations",
    keywords: [
      "project",
      "program",
      "operations",
      "ops",
      "coordinator",
      "scrum",
      "logistics",
      "supply",
    ],
    hebrew: [
      "פרויקט(ים)?",
      "פרוייקט(ים)?",
      "תפעול",
      "תפעולי(ת)?",
      "לוגיסטיקה",
      "רכש",
      "שרשרת אספקה",
      "מתאמ(ת)?",
      "רכז(ת)?",
      "סקראם",
      "תכנית",
      "תוכניות",
    ],
    questions: [
      "Tell me about a project that went off track. What did you do?",
      "How do you keep stakeholders updated on progress and risks?",
      "How do you plan a project with many dependencies?",
      "Describe a process you improved. What changed as a result?",
      "How do you handle a team member who keeps missing deadlines?",
      "How do you decide when to escalate a problem?",
    ],
  },
  {
    id: "data",
    label: "Data and analytics",
    keywords: ["data", "analyst", "analytics", "bi", "insights", "research"],
    hebrew: [
      "נתונים",
      "דאטה",
      "אנליסט(ית)?",
      "אנליטיקה",
      "מחקר",
      "חוקר(ת)?",
      "מדע(ן|נית) נתונים",
    ],
    questions: [
      "Walk me through an analysis that changed a business decision.",
      "How do you check that your data is correct before you share results?",
      "How would you explain a complex finding to someone without a technical background?",
      "How would you design an A/B test for a new feature?",
      "What would you do if the data contradicts what a senior stakeholder believes?",
      "Which metrics would you track to measure the health of a business like ours?",
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    keywords: [
      "marketing",
      "marketer",
      "growth",
      "brand",
      "content",
      "seo",
      "social",
      "communications",
      "pr",
    ],
    hebrew: [
      "שיווק",
      "שיווקי(ת)?",
      "משווק(ת)?",
      "מיתוג",
      "מותג",
      "תוכן",
      "קופירייטר(ית)?",
      "דיגיטל",
      "סושיאל",
      "רשתות חברתיות",
      "יחסי ציבור",
      "דוברות",
      "דובר(ת)?",
      "צמיחה",
      "קידום",
    ],
    questions: [
      "Tell me about a campaign you ran. What were the results?",
      "How do you decide which channels to invest in?",
      "How do you measure whether marketing is working?",
      "How would you launch a new product with a small budget?",
      "Describe a campaign that did not perform. What did you change?",
      "How do you get to know a target audience?",
    ],
  },
  {
    id: "sales",
    label: "Sales and customer success",
    keywords: [
      "sales",
      "account",
      "business development",
      "business developer",
      "bdr",
      "sdr",
      "customer",
      "success",
      "support",
      "service",
    ],
    hebrew: [
      "מכירות",
      "איש מכירות",
      "אשת מכירות",
      "לקוחות",
      "לקוח(ות)? מפתח",
      "שירות",
      "תמיכה",
      "פיתוח עסקי",
      "מפתח(ת)? עסקי(ת)?",
      "תיקי לקוחות",
      "מוקד(נית|ן)?",
      "נציג(ת)?",
    ],
    questions: [
      "Sell me this product.",
      "Tell me about a deal you lost. What would you do differently?",
      "How do you handle an angry customer?",
      "How do you prioritize your accounts or leads?",
      "Tell me about a time you turned around an unhappy customer.",
      "How do you handle the objection that the price is too high?",
    ],
  },
  {
    id: "people",
    label: "HR and recruiting",
    keywords: [
      "hr",
      "human resources",
      "recruit",
      "recruiter",
      "talent",
      "people",
      "hiring",
    ],
    hebrew: [
      "משאבי אנוש",
      "גיוס",
      "מגייס(ת)?",
      "השמה",
      "פיתוח ארגוני",
      "פיתוח הדרכה",
      "רכז(ת)? גיוס",
    ],
    questions: [
      "How do you assess whether a candidate is a good fit?",
      "Tell me about a difficult employee situation you handled.",
      "How would you improve employee retention?",
      "How do you handle confidential information?",
      "Tell me about a hiring process you improved.",
      "How do you balance the needs of the company and the employee?",
    ],
  },
  {
    id: "design",
    label: "Design",
    keywords: ["design", "designer", "ux", "ui", "researcher"],
    hebrew: ["עיצוב", "מעצב(ת)?", "חווי(ה|ית) משתמש", "ממשק"],
    questions: [
      "Walk me through a project in your portfolio, from problem to result.",
      "How do you handle feedback you disagree with?",
      "How do you decide when a design is good enough to ship?",
      "Tell me about a time user research changed your direction.",
      "How do you work with developers to make sure the design is built as intended?",
      "How do you balance user needs with business goals?",
    ],
  },
  {
    id: "finance",
    label: "Finance",
    keywords: [
      "finance",
      "financial",
      "accountant",
      "accounting",
      "controller",
      "bookkeeper",
      "economist",
    ],
    hebrew: [
      "כספים",
      "פיננס(ים)?",
      "פיננסי(ת)?",
      "חשב(ת)?",
      "רואה חשבון",
      "רואת חשבון",
      'רו"ח',
      "הנהלת חשבונות",
      "מנהל(ת)? חשבונות",
      "חשבונאות",
      "חשבונאי(ת)?",
      "כלכלן",
      "כלכלנית",
      "בקר(ית)?",
      "בקרה תקציבית",
      "תקציבים",
    ],
    questions: [
      "Walk me through how you build a budget or forecast.",
      "Tell me about a time you found an error in the numbers. What did you do?",
      "How do you explain financial results to non-financial managers?",
      "How do you make sure month-end close happens on time?",
      "Tell me about a cost saving you identified.",
      "How do you handle a deadline when the data you need is late?",
    ],
  },
  {
    id: "engineering",
    label: "Software engineering",
    // Matched by isSoftwareFamily below, so an electrical or civil engineer
    // gets the questions of their own field instead.
    keywords: [],
    questions: [
      "Tell me about a technical problem you are proud of solving.",
      "How do you approach debugging an issue you cannot reproduce?",
      "Tell me about a time you had to make a trade-off between speed and quality.",
      "How do you review someone else's work?",
      "Describe a system you built. What would you change today?",
      "How do you keep your skills up to date?",
    ],
  },
  {
    id: "hardware",
    label: "Engineering (not software)",
    keywords: [
      "electrical",
      "electronics",
      "mechanical",
      "civil",
      "structural",
      "chemical",
      "industrial",
      "hardware",
      "manufacturing",
      "process engineer",
      "production engineer",
      "biomedical",
      "aerospace",
      "materials",
      "rf",
      "asic",
      "fpga",
      "vlsi",
      "chip",
    ],
    hebrew: [
      "חשמל",
      "אלקטרוניקה",
      "מכונות",
      "מכני(ת)?",
      "בניין",
      "אזרחי(ת)?",
      "קונסטרוקציה",
      "קונסטרוקטור(ית)?",
      "מבנים",
      "כימי(ה|ת)?",
      "תעשייה וניהול",
      'תעו"נ',
      "חומרה",
      "ייצור",
      "תהליך",
      "ביו-?רפואי(ת)?",
      "אווירונאוטיקה",
      "חומרים",
      "שבבים",
      "אנרגיה",
    ],
    questions: [
      "Walk me through a design you took from requirements to a working product. What trade-offs did you make?",
      "How do you make sure a design meets the relevant safety standards and regulations?",
      "Tell me about a failure you found in testing or in the field. How did you find the root cause?",
      "How do you check your calculations or a design before it is approved?",
      "How do you work with manufacturing, suppliers or contractors when a design has to change?",
      "Tell me about a time you had to balance cost, schedule and quality.",
    ],
  },
  {
    id: "management",
    label: "Management",
    // "Manager" alone is left out: a Product Manager does not manage people.
    keywords: ["lead", "head", "director", "team leader", "supervisor"],
    hebrew: [
      "ראש צוות",
      "ראש תחום",
      "ראש מחלקה",
      "ראש אגף",
      "ראש מטה",
      'ר"צ',
      "מנהל(ת)? (צוות|מחלקה|אגף|תחום|סניף|משמרת|יחידה)",
      "אחראי(ת)? משמרת",
      'סמנכ"ל(ית)?',
      'מנכ"ל(ית)?',
      "דירקטור(ית)?",
      "מנהל(ת)? (כללי|כללית|פעילות)",
    ],
    questions: [
      "How would your team describe you as a manager?",
      "Tell me about a time you had to let someone go or deliver hard feedback.",
      "How do you help a struggling team member improve?",
      "How do you set goals for your team?",
      "Tell me about a time you had to lead change that people resisted.",
      "How do you build trust with a new team?",
    ],
  },
];

/**
 * Finds the role families that match a role title. A title can match more
 * than one, such as "Product Marketing Manager".
 */
export function matchRoleFamilies(title: string): RoleFamily[] {
  const words = ` ${title.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
  const matches = (family: RoleFamily) =>
    family.keywords.some(
      (keyword) =>
        words.includes(` ${keyword} `) || words.includes(` ${keyword}s `),
    ) || (family.hebrew ?? []).some((word) => hebrewWord(word).test(title));
  const hardware = matches(roleFamilies.find((f) => f.id === "hardware")!);
  return roleFamilies.filter((family) =>
    family.id === "engineering"
      ? isSoftwareFamily(title, words, hardware)
      : matches(family),
  );
}

const HEBREW_LETTER = "\\u05D0-\\u05EA";

/** A Hebrew word on its own, optionally after the prefix letters ו or ה. */
function hebrewWord(source: string): RegExp {
  return new RegExp(
    `(^|[^${HEBREW_LETTER}])[וה]{0,2}(${source})(?![${HEBREW_LETTER}])`,
    "i",
  );
}

/**
 * Software engineering questions fit software roles, and a plain "Engineer"
 * title, but not an electrical, mechanical or civil engineer.
 */
function isSoftwareFamily(
  title: string,
  words: string,
  hardware: boolean,
): boolean {
  if (isTechnicalRole(title)) return true;
  if (BUSINESS_DEVELOPER.test(title)) return false;
  if (/ (tester|qa) /.test(words) || / testers /.test(words)) return true;
  if (hardware) return false;
  return / engineers? /.test(words) || hebrewWord("מהנדס(ת)?").test(title);
}

const BUSINESS_DEVELOPER = /business develop|פיתוח עסקי|מפתח(ת)? עסקי/i;

/**
 * Software roles, whose professional round draws on core
 * engineering topics and whose case round is a system design interview.
 */
export function isTechnicalRole(title: string): boolean {
  // Not every engineer writes software: an electrical or civil engineer gets
  // the questions of their own field.
  // A business developer is a sales role, not a software one.
  if (BUSINESS_DEVELOPER.test(title)) return false;
  return (
    /\b(software|developer|programmer|devops|sre|backend|back-end|frontend|front-end|full[- ]?stack|qa|automation|web|mobile|ios|android|cloud|platform|data engineer|machine learning|ml engineer|ai engineer)\b/i.test(
      title,
    ) ||
    // Hebrew titles, such as "מפתח תוכנה" or "מהנדסת בקאנד".
    /מפתח|מתכנת|תוכנה|בקאנד|פרונטאנד|פולסטאק|דבאופס|הנדסת נתונים|מהנדס(ת)? נתונים|פיתוח(?! (ארגוני|הדרכה|מוצר|קהילה|לקוחות|הון))/.test(
      title,
    )
  );
}

/**
 * Roles whose interviews usually include writing code: software roles, and
 * data roles that are tested in SQL or Python.
 */
export function isCodingRole(title: string): boolean {
  return (
    isTechnicalRole(title) ||
    /\b(data (analyst|scientist)|analytics engineer|bi (developer|analyst)|business intelligence|quant(itative)?)\b/i.test(
      title,
    ) ||
    /אנליסט(ית)? (דאטה|נתונים)|מדע(ן|נית) נתונים|דאטה סיינטיסט/.test(title)
  );
}

/**
 * Kinds of coding problems real interviews use. Each exercise starts from a
 * different sample, so the problems vary.
 */
export const codingTopics = [
  "arrays and hash maps: counting, grouping or finding pairs",
  "strings: parsing, validating or transforming text",
  "two pointers or a sliding window over a sequence",
  "sorting with a custom order, and merging sorted data",
  "stacks and queues: matching, undo, or processing in order",
  "trees: traversal, depth, or searching a hierarchy",
  "graphs: reachability, shortest path or dependency order",
  "recursion and backtracking on a small search space",
  "dynamic programming on a realistic counting or cost problem",
  "intervals: merging, overlapping bookings or free time",
  "designing a small class with clear methods (a cache, a rate limiter, a queue)",
  "processing a log or event stream and reporting results",
  "working with dates and times in records",
  "transforming nested JSON-like data into a flat report",
  "binary search on sorted data or on an answer range",
  "heaps: top-k items or scheduling by priority",
];

/** SQL problems for data roles, over small tables given in the question. */
export const sqlTopics = [
  "joins across two or three tables, including rows with no match",
  "aggregation with GROUP BY and HAVING",
  "window functions: ranking, running totals or comparing to the previous row",
  "finding duplicates or gaps in records",
  "retention or cohort counts by month",
  "top N per group",
  "conditional aggregation to pivot rows into columns",
  "dates: activity per week, first and last events per user",
];

/** The commonly asked questions to show the AI for a role. */
export function bankFor(
  title: string,
  seniority: string | null = null,
): string[] {
  const families = matchRoleFamilies(title);
  const management = roleFamilies.find((f) => f.id === "management")!;
  if (seniority === "Manager" && !families.includes(management)) {
    families.push(management);
  }
  return [
    ...commonQuestions,
    ...families.flatMap((family) => family.questions),
  ];
}

/**
 * A random handful of the bank, in random order, so each interview starts
 * from different examples instead of the same first questions every time.
 */
export function sampleBank(
  bank: string[],
  count: number,
  random: () => number = Math.random,
): string[] {
  const shuffled = [...bank];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/** How many earlier questions the AI is shown so it does not repeat them. */
export const PREVIOUS_QUESTION_LIMIT = 60;

/**
 * Earlier questions for the same role or job, newest first, without exact
 * duplicates and capped, ready to list in the prompt.
 */
export function previousQuestionList(texts: string[]): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const text of texts) {
    const clean = text.trim().replace(/\s+/g, " ");
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    list.push(clean);
    if (list.length === PREVIOUS_QUESTION_LIMIT) break;
  }
  return list;
}

/**
 * Themes for behavioral questions. Each interview gets a random pair, so
 * the stories asked for change from one practice to the next.
 */
export const behavioralThemes = [
  "conflict with a colleague or manager",
  "a failure or mistake and what was learned",
  "working under a tight deadline",
  "prioritizing between competing tasks",
  "influencing without authority",
  "handling ambiguity or unclear requirements",
  "receiving and acting on difficult feedback",
  "taking ownership beyond the job description",
  "a difficult customer or stakeholder",
  "learning something new quickly",
  "improving a process or a way of working",
  "disagreeing with a decision and committing anyway",
  "helping a teammate succeed",
  "making a decision with incomplete data",
  "adapting to a big change",
  "an achievement and the candidate's specific part in it",
];

/**
 * Classic system design problems from real tech-company interviews. Without
 * a job posting, each design interview gets one at random, so the problem
 * matches the industry bar rather than the candidate's past jobs.
 */
export const systemDesignProblems = [
  "a URL shortener with click analytics",
  "a rate limiter for a public API",
  "a chat and messaging service with group chats and read receipts",
  "a news feed for a social network",
  "a notification service that sends push, email and SMS at scale",
  "a ride-hailing service that matches riders and drivers in real time",
  "a video upload and streaming platform",
  "a distributed key-value cache",
  "a payment processing system that never charges twice",
  "a search autocomplete service",
  "a file storage and sync service like a cloud drive",
  "a web crawler that indexes billions of pages",
  "an e-commerce checkout with flash sales and limited stock",
  "a metrics and monitoring system that ingests millions of events a second",
  "a collaborative document editor",
  "a job scheduler that runs millions of delayed and recurring tasks",
  "a hotel or flight booking system that prevents double booking",
  "a leaderboard for a mobile game with millions of players",
];

/**
 * Areas real technical rounds cover. Each technical interview gets a random
 * few, adapted to the role's stack, so practice goes beyond one comfort zone.
 */
export const technicalTopics = [
  "data structures and time and space complexity",
  "database indexing, query plans and transactions",
  "SQL versus NoSQL trade-offs",
  "caching strategies and cache invalidation",
  "concurrency, race conditions and locking",
  "API design, versioning and idempotency",
  "message queues and asynchronous processing",
  "consistency, replication and partitioning in distributed systems",
  "authentication, authorization and common security flaws",
  "debugging a production incident from logs and metrics",
  "performance profiling and memory leaks",
  "HTTP, networking and what happens when a request is made",
  "testing strategy: unit, integration and end-to-end",
  "observability: logging, metrics and tracing",
  "deployment, CI/CD and rolling back safely",
  "containers and running services in the cloud",
  "designing a data model for a new feature",
  "code review and keeping a large codebase maintainable",
];
