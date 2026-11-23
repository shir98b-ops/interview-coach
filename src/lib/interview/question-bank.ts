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
  /**
   * Topics the professional round of this field covers, with the Israeli laws
   * and standards behind them, so questions hold the real bar of the field.
   */
  focus?: string[];
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
    focus: [
      "product sense: designing or improving a product for a defined user",
      "metrics: choosing a north-star metric and diagnosing a metric drop",
      "prioritization: frameworks, trade-offs and saying no to stakeholders",
      "experimentation: designing an A/B test and reading its results",
      "writing a spec and working with engineering and design",
      "user research and turning insights into decisions",
      "estimation and market sizing done out loud",
      "launch and go-to-market planning",
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
      "procurement",
      "purchasing",
      "buyer",
    ],
    hebrew: [
      "פרויקט(ים)?",
      "פרוייקט(ים)?",
      "תפעול",
      "תפעולי(ת)?",
      "לוגיסטיקה",
      "רכש",
      "קניי?(ן|נית)",
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
    focus: [
      "planning: scope, dependencies, critical path and estimates",
      "risk management and when to escalate",
      "stakeholder communication and status reporting",
      "Agile and Scrum versus waterfall, and when each fits",
      "budget, resources and tracking progress against plan",
      "improving a process with data (for operations roles)",
      "vendor, procurement and contract management",
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
    focus: [
      "SQL: joins, aggregation and window functions, explained in words",
      "statistics: significance, confidence intervals and sample size",
      "analyzing an A/B test and its common pitfalls",
      "designing metrics and investigating a sudden metric change",
      "data quality: validating results before sharing them",
      "dashboards and visualizations that do not mislead",
      "presenting findings and a recommendation to non-technical managers",
      "Python or Excel for analysis",
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
      "social media",
      "communications",
      "pr",
      "copywriter",
      "community",
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
    focus: [
      "funnel economics: CAC, LTV, conversion and payback",
      "channel strategy and budget allocation",
      "attribution and incrementality testing",
      "positioning, messaging and audience segmentation",
      "campaign planning and creative testing",
      "SEO and content strategy",
      "marketing analytics tools (GA4, ad platforms) and reporting",
      "privacy and consent rules (the Israeli Privacy Protection Law, GDPR) and the anti-spam rules of the Communications Law",
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
      "support representative",
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
    focus: [
      "prospecting and the first outreach message or call",
      "discovery and qualification frameworks (BANT, MEDDIC)",
      "handling objections",
      "pipeline management and forecasting",
      "negotiation and closing",
      "account management, renewals and expansion (for customer success roles)",
      "CRM discipline and reporting",
      "pitching the product in a short mock call",
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
      "hrbp",
      "payroll",
    ],
    hebrew: [
      "משאבי אנוש",
      "גיוס",
      "מגייס(ת)?",
      "השמה",
      "פיתוח ארגוני",
      "פיתוח הדרכה",
      "רכז(ת)? גיוס",
      "שכר",
    ],
    questions: [
      "How do you assess whether a candidate is a good fit?",
      "Tell me about a difficult employee situation you handled.",
      "How would you improve employee retention?",
      "How do you handle confidential information?",
      "Tell me about a hiring process you improved.",
      "How do you balance the needs of the company and the employee?",
    ],
    focus: [
      "Israeli employment law: a hearing before dismissal, notice, severance and the Hours of Work and Rest Law",
      "running a full recruiting process and reducing bias in interviews",
      "onboarding, retention and handling an exit interview",
      "handling a sexual harassment complaint under the Prevention of Sexual Harassment Law",
      "performance reviews, development plans and difficult feedback",
      "HR metrics: turnover, time to hire and engagement",
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
    focus: [
      "walking through a portfolio project from problem to result",
      "user research methods and usability testing",
      "information architecture and interaction design",
      "design systems and consistency across a product",
      "accessibility (WCAG and the Israeli accessibility regulations)",
      "trade-offs with product and engineering",
      "measuring whether a design succeeded",
      "critiquing an existing product",
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
      "cfo",
      "audit",
      "auditor",
      "tax",
      "fp&a",
      "investment",
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
      "מבקר(ת)? פנים",
      "ביקורת",
      'סמנכ"ל(ית)? כספים',
      "מיסוי",
      "יוע(ץ|צת) מס",
    ],
    questions: [
      "Walk me through how you build a budget or forecast.",
      "Tell me about a time you found an error in the numbers. What did you do?",
      "How do you explain financial results to non-financial managers?",
      "How do you make sure month-end close happens on time?",
      "Tell me about a cost saving you identified.",
      "How do you handle a deadline when the data you need is late?",
    ],
    focus: [
      "the three financial statements and how they connect",
      "budgeting, forecasting and explaining a variance",
      "month-end close, reconciliations and controls",
      "Israeli tax basics: VAT, corporate tax and withholding",
      "accounting standards (Israeli GAAP and IFRS) for revenue and leases",
      "Excel modeling: lookups, pivot tables and a simple model built out loud",
      "cash flow management and working capital",
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
      // In Israeli job ads, "מהנדס/ת מוצר" is a hardware or mechanical role.
      "מהנדס(ת)? מוצר",
      "הנדסת מוצר",
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
      "אדריכל(ית)?",
      "אדריכלות",
    ],
    questions: [
      "Walk me through a design you took from requirements to a working product. What trade-offs did you make?",
      "How do you make sure a design meets the relevant safety standards and regulations?",
      "Tell me about a failure you found in testing or in the field. How did you find the root cause?",
      "How do you check your calculations or a design before it is approved?",
      "How do you work with manufacturing, suppliers or contractors when a design has to change?",
      "Tell me about a time you had to balance cost, schedule and quality.",
    ],
    focus: [
      "reading and checking a design against requirements, standards and safety margins (Israeli Standards, the Electricity Law or the Planning and Building Law, as fits the field)",
      "a calculation of the field done out loud: loads, currents, tolerances, flow or a power budget",
      "testing and verification: test plans, failure analysis and root cause",
      "working with manufacturing, suppliers and site contractors on changes",
      "choosing materials or components by cost, availability and reliability",
      "safety, quality systems (ISO 9001) and documentation of changes",
    ],
  },
  {
    id: "social",
    label: "Social work and therapy",
    keywords: [
      "social worker",
      "social work",
      "psychologist",
      "psychotherapist",
      "therapist",
      "counselor",
      "case manager",
    ],
    hebrew: [
      "עובד(ת)? סוציאלי(ת)?",
      "עבודה סוציאלית",
      'עו"ס',
      "פסיכולוג(ית)?",
      "פסיכותרפיסט(ית)?",
      "מטפל(ת)? רגשי(ת)?",
      "רווחה",
      "שירותים חברתיים",
      "קרימינולוג(ית)?",
    ],
    questions: [
      "Why did you choose this profession, and what keeps you in it?",
      "Tell me about a client you found hard to work with. What did you do?",
      "How do you decide when you must break confidentiality?",
      "Tell me about a crisis situation you handled. What did you do first?",
      "How do you build trust with a client who does not want help?",
      "How do you protect yourself from burnout in this work?",
    ],
    focus: [
      "assessing risk to a minor or a helpless person, and the duty to report under Israeli law (Penal Law section 368D, the Youth Law on care and supervision)",
      "intake and psychosocial assessment, and writing a treatment plan with goals",
      "confidentiality and its limits, and working with the welfare department, courts and police",
      "crisis intervention: suicide risk, domestic violence and emergency placement",
      "professional ethics and boundaries (the code of ethics of social workers in Israel)",
      "working with diverse populations: Haredi, Arab, immigrant and peripheral communities",
      "working in a multidisciplinary team and with the family around the client",
      "documentation, caseload management and supervision",
    ],
  },
  {
    id: "education",
    label: "Teaching and education",
    keywords: [
      "teacher",
      "educator",
      "tutor",
      "kindergarten",
      "preschool",
      "school",
      "lecturer",
      "instructional",
    ],
    hebrew: [
      "מורה",
      "מורים",
      "מחנך",
      "מחנכת",
      "חינוך",
      "חינוכי(ת)?",
      "הוראה",
      "גננת",
      "גנן",
      "סייע(ת)?",
      "יוע(ץ|צת) חינוכי(ת)?",
      "רכז(ת)? פדגוגי(ת)?",
      "מרצה",
      "מורה מקצועי(ת)?",
    ],
    questions: [
      "Describe a lesson that went really well. What made it work?",
      "How do you handle a student who disrupts the class again and again?",
      "How do you teach a class where students are at very different levels?",
      "Tell me about a difficult conversation with a parent.",
      "How do you know your students actually learned what you taught?",
      "Tell me about a student you helped through a hard period.",
    ],
    focus: [
      "planning a lesson with clear goals, and differentiated teaching for mixed levels",
      "classroom management and a consistent response to violence (Ministry of Education director-general circulars)",
      "including students with special needs, an individual education plan and the inclusion committee (Special Education Law)",
      "assessment beyond tests: formative assessment, feedback and preparing for matriculation exams (bagrut)",
      "working with parents, the homeroom teacher, the school counselor and the principal",
      "identifying and reporting suspected abuse or neglect of a student",
      "teaching with digital tools and keeping students engaged",
      "the subject itself: explaining a core topic of the subject at the level of the class",
    ],
  },
  {
    id: "health",
    label: "Nursing and health care",
    keywords: [
      "nurse",
      "nursing",
      "doctor",
      "physician",
      "medical",
      "pharmacist",
      "physiotherapist",
      "physical therapist",
      "occupational therapist",
      "dietitian",
      "paramedic",
      "caregiver",
      "clinical",
      "dentist",
      "hygienist",
      "veterinarian",
    ],
    hebrew: [
      "אח",
      "אחות",
      "אחיות",
      "סיעוד",
      "סיעודי(ת)?",
      "רופא(ה)?",
      "רפואה",
      "רפואי(ת)?",
      "רוקח(ת)?",
      "פיזיותרפיסט(ית)?",
      "פיזיותרפיה",
      "מרפא(ה|ת)? בעיסוק",
      "ריפוי בעיסוק",
      "דיאטנ(ית)?",
      "דיאטן",
      "תזונאי(ת)?",
      "פרמדיק(ית)?",
      "חובש(ת)?",
      "קלינאי(ת)? תקשורת",
      "קליני(ת)?",
      "רופא(ת)? שיניים",
      "שיננ(ית)?",
      "מטפל(ת)? סיעודי(ת)?",
      "וטרינר(ית)?",
    ],
    questions: [
      "Tell me about a time you noticed something was wrong with a patient before others did.",
      "How do you prioritize when several patients need you at once?",
      "Tell me about a mistake, or a near miss, at work. What did you do?",
      "How do you handle an angry or frightened family member?",
      "Tell me about a disagreement with a doctor or a colleague about care.",
      "How do you keep going after a hard shift or the loss of a patient?",
    ],
    focus: [
      "patient safety: errors in this profession's scope (for nurses, the five rights of medication) and reporting an adverse event",
      "triage and prioritizing deteriorating patients (early warning signs, ABCDE)",
      "infection control, isolation and hand hygiene",
      "informed consent and patient rights under the Israeli Patient's Rights Law",
      "documentation and handover between shifts",
      "communicating with patients and families, including delivering bad news",
      "ethical dilemmas: refusal of treatment, end of life and confidentiality",
      "working by Ministry of Health procedures and clinical guidelines in a multidisciplinary team",
    ],
  },
  {
    id: "legal",
    label: "Law and compliance",
    keywords: [
      "lawyer",
      "attorney",
      "legal",
      "counsel",
      "paralegal",
      "compliance",
      "solicitor",
    ],
    hebrew: [
      "עורך דין",
      "עורכת דין",
      "עורכי דין",
      'עו"ד',
      "משפט(ים)?",
      "משפטי(ת)?",
      "משפטן",
      "משפטנית",
      'יועמ"ש',
      "יועצ(ת)? משפטי(ת)?",
      "יועץ משפטי",
      "ציות",
      "רגולציה",
      "פרלגל",
      "מתמחה במשפטים",
    ],
    questions: [
      "Tell me about a legal issue you worked on from start to finish.",
      "How do you explain a legal risk to a manager who wants a yes or no?",
      "Tell me about a time you disagreed with a client or a senior lawyer.",
      "How do you handle a deadline when the facts are still unclear?",
      "Tell me about a mistake you caught in a contract or a document.",
      "How do you keep up with changes in the law in your field?",
    ],
    focus: [
      "reviewing a commercial contract: liability, indemnity, termination and the clauses to push back on (Israeli Contracts Law)",
      "privacy and data protection: the Israeli Privacy Protection Law, its Amendment 13 and the Data Security Regulations",
      "employment law basics: hearings before dismissal, working hours and severance",
      "corporate law: the Companies Law, directors' duties and approving transactions",
      "litigation strategy: assessing the chances of a claim and recommending settlement or trial",
      "legal research and writing a short opinion for a non-lawyer",
      "professional ethics: conflicts of interest and privilege under the Israel Bar Association rules",
      "building a compliance program and handling a regulator's inquiry",
    ],
  },
  {
    id: "service",
    label: "Retail, hospitality and service",
    keywords: [
      "retail",
      "store",
      "shop",
      "cashier",
      "hospitality",
      "hotel",
      "restaurant",
      "waiter",
      "waitress",
      "barista",
      "bartender",
      "chef",
      "cook",
      "receptionist",
      "front desk",
      "flight attendant",
    ],
    hebrew: [
      "מלצר(ית)?",
      "ברמנ(ית)?",
      "ברמן",
      "בריסטה",
      "קופאי(ת)?",
      "מוכר(ת)?",
      "חנות",
      "קמעונאות",
      "מלון",
      "מלונאות",
      "מסעדה",
      "טבח(ית)?",
      "שף",
      "פקיד(ת)? קבלה",
      "דלפק קבלה",
      "דייל(ת)?",
      "דיילת",
      "מארח(ת)?",
    ],
    questions: [
      "Tell me about the busiest shift you worked. How did you cope?",
      "A customer is shouting at you in front of others. What do you do?",
      "How would you recommend another product to a customer without pushing?",
      "Tell me about a time you went beyond what a customer expected.",
      "What do you do when a colleague does not pull their weight during a shift?",
      "Why do you want to work here, of all places?",
    ],
    focus: [
      "handling a complaint on the spot, and when to call a manager",
      "managing a rush: priorities, teamwork and keeping service quality",
      "upselling and recommending products the customer actually needs",
      "food safety and hygiene, or safety and security rules of the workplace",
      "opening and closing procedures, cash handling and stock",
      "meeting service standards and handling special requests",
    ],
  },
  {
    id: "public",
    label: "Public sector",
    keywords: [
      "government",
      "municipal",
      "municipality",
      "public sector",
      "civil service",
      "policy",
      "ministry",
    ],
    hebrew: [
      "ממשלה",
      "ממשלתי(ת)?",
      "עירייה",
      "עירוני(ת)?",
      "מועצה",
      "רשות",
      "רשות מקומית",
      "מדיניות",
      "שירות המדינה",
      "מגזר ציבורי",
      "ציבורי(ת)?",
      "רפרנט(ית)?",
      "מכרזים",
    ],
    questions: [
      "Why do you want to work in the public sector?",
      "Tell me about a time you had to follow a rule you thought was wrong.",
      "How do you handle a citizen who is angry about a decision you cannot change?",
      "Tell me about a project that needed several organizations to cooperate.",
      "How do you make a decision when you have to balance fairness and efficiency?",
      "How do you work within a fixed budget and slow approval processes?",
    ],
    focus: [
      "public procurement: the Mandatory Tenders Law, writing requirements and evaluating bids fairly",
      "the budget process, commitments and working within budget lines",
      "administrative law basics: fairness, equality, a reasoned decision and the right to be heard",
      "freedom of information requests and transparency",
      "policy analysis: defining the problem, options, costs and who is affected",
      "coordinating between ministries, local authorities and the public",
      "civil service ethics and conflicts of interest",
    ],
  },
  {
    id: "security",
    label: "Cyber security",
    keywords: [
      "cyber",
      "cybersecurity",
      "security analyst",
      "security engineer",
      "soc",
      "penetration",
      "pentester",
      "infosec",
      "ciso",
    ],
    hebrew: ["סייבר", "אבטחת מידע", "הגנת סייבר", "חוקר(ת)? סייבר"],
    questions: [
      "Walk me through how you would investigate a suspicious alert.",
      "Tell me about a security incident you handled. What did you learn?",
      "How do you convince developers to fix a vulnerability now?",
      "How do you stay current with new threats?",
      "Tell me about a time you had to balance security with convenience.",
      "Which security project are you most proud of?",
    ],
    focus: [
      "incident response: triage, containment, investigation and lessons learned",
      "web application vulnerabilities (OWASP Top 10) and how to prevent them",
      "network fundamentals for security: TCP/IP, DNS, TLS and common attacks",
      "identity and access: authentication, least privilege and secrets",
      "monitoring and detection: logs, SIEM rules and reducing false positives",
      "vulnerability management and prioritizing by real risk",
      "cloud security basics and misconfigurations",
      "regulation in Israel: the Privacy Protection (Data Security) Regulations and the National Cyber Directorate guidelines",
    ],
  },
  {
    id: "admin",
    label: "Office and administration",
    keywords: [
      "office manager",
      "secretary",
      "executive assistant",
      "personal assistant",
      "administrative",
      "admin",
      "clerk",
    ],
    hebrew: [
      "מזכיר(ה)?",
      "מזכירות",
      "אדמיניסטרציה",
      "אדמיניסטרטיבי(ת)?",
      "עוזר(ת)? אישי(ת)?",
      "מנהל(ת)? משרד",
      "פקיד(ה|ת)?",
      "רכז(ת)? משרד",
      "בק אופיס",
      "בק-אופיס",
    ],
    questions: [
      "How do you organize your day when everything is urgent?",
      "Tell me about a time you handled confidential information.",
      "How do you manage a busy manager's calendar and requests?",
      "Tell me about a process in the office you made more efficient.",
      "How do you handle a request from a senior person that conflicts with another?",
      "Which tools do you use every day, and how well do you know Excel?",
    ],
    focus: [
      "managing a calendar, meetings and travel for several people",
      "prioritizing many small requests and following up on open items",
      "confidentiality and handling sensitive documents",
      "working with suppliers, orders and simple budgets",
      "office tools: Excel formulas and tables, Word and shared drives",
      "organizing an event or an office move",
    ],
  },
  {
    id: "it",
    label: "IT and system administration",
    keywords: [
      "it",
      "it support",
      "helpdesk",
      "help desk",
      "system administrator",
      "sysadmin",
      "network administrator",
      "network engineer",
    ],
    hebrew: [
      "תמיכה טכנית",
      "מנהל(ת)? רשת",
      "מנהל(ת)? מערכות מידע",
      "סיסטם",
      "הלפדסק",
      "מחשוב",
    ],
    questions: [
      "A user says they cannot connect to the network. How do you troubleshoot it?",
      "How do you prioritize when many tickets arrive at once?",
      "Tell me about an outage you handled. What did you learn?",
      "How do you explain a technical problem to a non-technical user?",
      "How do you keep systems patched and backed up?",
      "Tell me about something you automated to save time.",
    ],
    focus: [
      "troubleshooting a connectivity or login problem step by step",
      "networking basics: DNS, DHCP, VPN, routing and firewalls",
      "Active Directory, identities and permissions",
      "endpoint management, patching and backups",
      "security hygiene: phishing, MFA and least privilege",
      "ticket prioritization and SLAs",
      "administering cloud and SaaS tools (Microsoft 365, Google Workspace)",
    ],
  },
  {
    id: "consulting",
    label: "Consulting and strategy",
    keywords: ["consultant", "consulting", "strategy", "strategist"],
    hebrew: [
      "יוע(ץ|צת) (אסטרטגי(ת)?|עסקי(ת)?|ניהולי(ת)?|ארגוני(ת)?)",
      "ייעוץ (אסטרטגי|עסקי|ניהולי|ארגוני)",
      "אסטרטגיה",
      "אסטרטג(ית)?",
    ],
    questions: [
      "Why consulting, and why our firm?",
      "Tell me about a time you solved an ambiguous problem with limited data.",
      "Tell me about a time you had to convince a senior stakeholder.",
      "How do you structure a problem you have never seen before?",
      "Tell me about a recommendation you made that was not accepted.",
      "How do you work under tight deadlines with several clients?",
    ],
    focus: [
      "structuring a business problem with a hypothesis tree",
      "market sizing done out loud",
      "profitability analysis: revenue and cost drivers",
      "reading a chart or a data exhibit quickly and drawing the insight",
      "synthesizing a recommendation for a CEO in one minute",
      "client management and handling pushback",
    ],
  },
  {
    id: "management",
    label: "Management",
    // "Manager" alone is left out: a Product Manager does not manage people.
    keywords: [
      "lead",
      "head",
      "director",
      "team leader",
      "supervisor",
      "engineering manager",
      "vp",
    ],
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
    focus: [
      "hiring and building a team",
      "performance management and difficult feedback",
      "setting goals and priorities for a team",
      "managing up and working with stakeholders",
      "leading a change people resist",
      "delegating and developing people",
      "budget and resource decisions",
    ],
  },
];

/**
 * Finds the role families that match a role title. A title can match more
 * than one, such as "Product Marketing Manager".
 */
export function matchRoleFamilies(rawTitle: string): RoleFamily[] {
  // Hebrew abbreviations are typed with either quote mark: עו"ד or עו״ד.
  const title = rawTitle.replace(/[״”“]/g, '"');
  const words = ` ${title.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
  const matches = (family: RoleFamily) =>
    family.keywords.some(
      (keyword) =>
        words.includes(` ${keyword} `) || words.includes(` ${keyword}s `),
    ) || (family.hebrew ?? []).some((word) => hebrewWord(word).test(title));
  const hardware = matches(roleFamilies.find((f) => f.id === "hardware")!);
  // A Hebrew "product engineer" designs physical products, not a product
  // manager's work.
  const productEngineer = hebrewWord("(מהנדס(ת)?|הנדסת) מוצר").test(title);
  return roleFamilies.filter((family) =>
    family.id === "engineering"
      ? isSoftwareFamily(title, words, hardware)
      : family.id === "product" && productEngineer
        ? false
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
    SOFTWARE_TITLE.test(title) ||
    QUALIFIED_ENGINEER.test(title) ||
    // Hebrew titles, such as "מפתח תוכנה" or "מהנדסת בקאנד".
    /מפתח|מתכנת|תוכנה|בקאנד|פרונטאנד|פולסטאק|דבאופס|הנדסת נתונים|מהנדס(ת)? נתונים|מדע(ן|נית) נתונים|דאטה סיינטיסט|אלגוריתמ|קושחה|משובצות|אמבדד|פיתוח(?! (ארגוני|הדרכה|מוצר|קהילה|לקוחות|הון|עסקי))/.test(
      title,
    )
  );
}

/** Titles that name software work on their own. */
const SOFTWARE_TITLE =
  /\b(software|developer|programmer|devops|sre|site reliability|backend|back-end|frontend|front-end|full[- ]?stack|qa|ios|android|data engineer|machine learning|ml engineer|ai engineer|mlops|data scientist|computer vision|algorithms?|embedded|firmware|tech lead|engineering manager|software architect|solutions architect)\b/i;

/**
 * Words like "web", "cloud" or "automation" mean software only next to an
 * engineering word: a Web Analyst or a Marketing Automation Manager is not a
 * developer.
 */
const QUALIFIED_ENGINEER =
  /\b(web|mobile|cloud|platform|automation|infrastructure|test|r&d|security|network|integration)\s+(developer|engineer|architect)s?\b/i;

/**
 * Software specialties, each with the topics its professional round covers
 * and the design problems its case round uses. Titles that name none of
 * these (backend, full stack, plain "software engineer") use the general
 * technical topics and system design problems.
 */
export interface TechSpecialty {
  id: string;
  label: string;
  pattern: RegExp;
  topics: string[];
  designProblems: string[];
}

export const techSpecialties: TechSpecialty[] = [
  {
    id: "frontend",
    label: "Frontend",
    pattern:
      /front-?end|פרונט|\b(react|angular|vue|web developer|ui developer|ui engineer)\b/i,
    topics: [
      "rendering performance: the critical rendering path, reflows and Core Web Vitals",
      "state management in a large single-page app",
      "the JavaScript event loop, promises and async pitfalls",
      "browser security: XSS, CSRF, Content Security Policy and where to keep tokens",
      "accessibility: semantic HTML, ARIA, keyboard and screen readers",
      "component design and reuse in React or a similar framework",
      "loading performance: caching, bundling and code splitting",
      "testing UI: unit, component and end-to-end tests",
    ],
    designProblems: [
      "the front end of a collaborative spreadsheet that runs in the browser",
      "an infinite-scroll feed client that also works offline",
      "a component library and design system used by 20 product teams",
      "a live dashboard that renders thousands of updates a second",
      "a checkout front end that stays fast on slow mobile networks",
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    pattern:
      /mobile|\b(ios|android|swift|kotlin|flutter|react native)\b|מובייל/i,
    topics: [
      "the app lifecycle and background work limits on iOS and Android",
      "offline-first data and syncing with a server",
      "memory, battery and app start-up performance",
      "releasing: store review, staged rollouts, feature flags and crash reporting",
      "networking on unreliable connections",
      "secure storage and authentication on the device",
      "the UI thread and avoiding dropped frames",
      "app architecture (MVVM, clean architecture) and testing",
    ],
    designProblems: [
      "a mobile chat app with offline messages and push notifications",
      "a driver app that tracks location in the background all day",
      "a photo-sharing app that uploads reliably on flaky networks",
      "a banking app's sign-in, session handling and secure local storage",
      "feature flags and staged rollouts for an app with millions of users",
    ],
  },
  {
    id: "devops",
    label: "DevOps and infrastructure",
    pattern:
      /devops|\b(sre|site reliability|platform engineer|cloud engineer|infrastructure|network engineer)\b|דבאופס|תשתיות/i,
    topics: [
      "CI/CD design and safe deployments (blue-green, canary, rollback)",
      "Kubernetes: scheduling, probes, resource limits and debugging a crashing pod",
      "infrastructure as code (Terraform) and managing its state",
      "observability, SLOs and designing alerts people trust",
      "incident response and blameless postmortems",
      "networking: DNS, load balancers and TLS",
      "cloud cost optimization",
      "secrets management and least privilege",
    ],
    designProblems: [
      "a CI/CD pipeline for 50 microservices with safe rollbacks",
      "the logging, metrics and alerting stack for a growing SaaS",
      "a multi-region deployment with disaster recovery for a payments service",
      "a Kubernetes platform that many teams deploy to on their own",
      "autoscaling and cost control for a very spiky workload",
    ],
  },
  {
    id: "qa",
    label: "QA and test automation",
    pattern: /\b(qa|tester|test|testing|automation)\b|בודק(ת)? תוכנה|בדיקות/i,
    topics: [
      "a test strategy and the test pyramid for a product",
      "designing test cases: boundaries, equivalence classes and negative tests",
      "designing an automation framework that stays maintainable",
      "flaky tests: their causes and how to fix them",
      "API testing and contract testing",
      "performance and load testing",
      "bug reports, severity versus priority, and release decisions",
      "testing in CI and catching problems earlier",
    ],
    designProblems: [
      "a test automation framework for a web and mobile product released weekly",
      "the testing strategy for a payments API before a major release",
      "end-to-end and load testing for a ticket sale with 100,000 users at once",
      "a process that detects and quarantines flaky tests in CI",
      "quality gates for a microservices system built by 30 teams",
    ],
  },
  {
    id: "data",
    label: "Data engineering",
    pattern:
      /data engineer|analytics engineer|\betl\b|big data|הנדסת נתונים|מהנדס(ת)? (נתונים|דאטה)/i,
    topics: [
      "data modeling for analytics: star schemas and slowly changing dimensions",
      "batch versus streaming processing",
      "SQL performance on large tables, partitioning and clustering",
      "idempotent, re-runnable pipelines and backfills",
      "orchestration (Airflow or similar) and dependencies between jobs",
      "data quality checks and lineage",
      "Spark: shuffles, data skew and partitioning",
      "data warehouse versus data lake trade-offs",
    ],
    designProblems: [
      "a pipeline that loads clickstream events into a warehouse for daily reports",
      "change data capture from a production database into analytics",
      "data quality monitoring for 500 tables",
      "a near-real-time pipeline that computes fraud features",
      "a data lake layout with partitions, schemas and retention",
    ],
  },
  {
    id: "ml",
    label: "Machine learning and data science",
    pattern:
      /machine learning|\b(ml|ai) engineer|mlops|data scientist|computer vision|\bnlp\b|algorithm|אלגוריתמ|מדע(ן|נית) נתונים|דאטה סיינטיסט/i,
    topics: [
      "bias and variance, overfitting and regularization",
      "choosing evaluation metrics, especially for imbalanced data",
      "feature engineering and data leakage",
      "offline versus online evaluation, and A/B testing a model",
      "serving models in production: latency, batching and monitoring drift",
      "classic models versus deep learning, and when each fits",
      "working with noisy or scarce labels",
      "explaining a model's decisions to stakeholders",
    ],
    designProblems: [
      "a recommendation system for an online store's home page",
      "a fraud detection model that scores payments in real time",
      "a search ranking system with offline and online evaluation",
      "a content moderation classifier with human review",
      "a demand forecasting model retrained weekly and monitored for drift",
    ],
  },
  {
    id: "embedded",
    label: "Embedded and firmware",
    pattern: /embedded|firmware|\brtos\b|קושחה|משובצות|אמבדד/i,
    topics: [
      "interrupts, priorities and race conditions on a microcontroller",
      "RTOS tasks, scheduling and priority inversion",
      "memory limits: stack, heap, fragmentation and static allocation",
      "communication buses: I2C, SPI, UART and CAN",
      "low-power design and sleep modes",
      "debugging hardware and firmware together (oscilloscope, JTAG, logic analyzer)",
      "C pitfalls: volatile, undefined behavior, pointers and alignment",
      "bootloaders and safe firmware updates",
    ],
    designProblems: [
      "firmware for a battery-powered sensor that reports over Bluetooth Low Energy",
      "over-the-air firmware updates for 100,000 devices that must never brick",
      "a motor-control loop on a microcontroller with hard real-time limits",
      "a data logger that survives power loss without corrupting its storage",
      "a driver and protocol stack for a new peripheral on an RTOS",
    ],
  },
];

/** The specialty a software title names, if any. */
export function techSpecialtyFor(title: string): TechSpecialty | null {
  return techSpecialties.find((s) => s.pattern.test(title)) ?? null;
}

/**
 * Topics for a software role's professional round: mostly its specialty,
 * plus one general engineering topic, so practice holds the specialty's bar
 * without losing the fundamentals every engineer is asked about.
 */
export function technicalTopicsFor(
  title: string,
  count: number,
  random: () => number = Math.random,
): string[] {
  const specialty = techSpecialtyFor(title);
  if (!specialty) return sampleBank(technicalTopics, count, random);
  return [
    ...sampleBank(specialty.topics, count - 1, random),
    ...sampleBank(technicalTopics, 1, random),
  ];
}

/** One design problem that fits a software role's specialty. */
export function designProblemFor(
  title: string,
  random: () => number = Math.random,
): string {
  const specialty = techSpecialtyFor(title);
  return sampleBank(
    specialty?.designProblems ?? systemDesignProblems,
    1,
    random,
  )[0];
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

/**
 * The professional topics of a role's fields, for its professional and case
 * rounds. Software roles use technicalTopics instead.
 */
export function focusAreasFor(title: string): string[] {
  return matchRoleFamilies(title).flatMap((family) => family.focus ?? []);
}

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
