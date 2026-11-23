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
    keywords: [
      "design",
      "designer",
      "ux",
      "ui",
      "ux researcher",
      "user researcher",
    ],
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
      "quant",
      "quantitative",
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
      "silicon",
      "rtl",
      "verification",
      "physical design",
      "pcb",
      "board design",
      "board designer",
      "layout engineer",
      "signal integrity",
      "analog",
      "antenna",
      "radar",
      "microwave",
      "power systems",
      "high voltage",
      "substation",
      "solar",
      "photovoltaic",
      "robotics",
      "mechatronics",
      "optical",
      "optics",
      "photonics",
      "laser",
      "reliability",
      "avionics",
      "systems engineer",
      "system engineer",
      "quality engineer",
      "validation engineer",
      "environmental engineer",
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
      "וריפיקציה",
      "תכנון לוגי",
      "אנלוגי(ת)?",
      "אנטנות",
      "מתח גבוה",
      "סולארי(ת)?",
      "מהנדס(ת)? מערכת",
      "הנדסת מערכת",
      "רובוטיקה",
      "מכטרוניקה",
      "אופטיקה",
      "פוטוניקה",
      "אמינות",
      "מהנדס(ת)? איכות",
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
    id: "lab",
    label: "Laboratory and life sciences research",
    // Matched in matchRoleFamilies, so a chemistry teacher stays a teacher
    // and an electronics lab technician stays in hardware.
    keywords: [
      "lab technician",
      "laboratory technician",
      "lab assistant",
      "laboratory assistant",
      "lab analyst",
      "laboratory analyst",
      "lab scientist",
      "laboratory scientist",
      "lab manager",
      "laboratory",
      "chemist",
      "biologist",
      "microbiologist",
      "biochemist",
      "biotechnologist",
      "immunologist",
      "geneticist",
      "chemistry",
      "biology",
      "microbiology",
      "biochemistry",
      "biotechnology",
      "biotech",
      "molecular",
      "cell culture",
      "genomics",
      "histology",
      "histotechnologist",
      "qc analyst",
      "quality control analyst",
      "qc chemist",
      "qc microbiologist",
      "formulation",
      "protein",
      "antibody",
      "assay",
      "analytical development",
      "process development scientist",
    ],
    hebrew: [
      "לבורנט(ית|ים)?",
      "טכנאי(ת)? מעבדה",
      "מעבד(ה|ת|ות)",
      "כימאי(ת|ים)?",
      "כימיה (אנליטית|אורגנית)",
      "ביולוג(ית|ים)?",
      "ביולוגיה",
      "מיקרוביולוג(ית|ים)?",
      "מיקרוביולוגיה",
      "ביוכימאי(ת)?",
      "ביוכימיה",
      "ביוטכנולוג(ית|יה)?",
      "גנטיקה",
      "גנומיקה",
      "תרבי(ת|יות) תאים",
      "אנליסט(ית)? (QC|בקרת איכות)",
    ],
    questions: [
      "Walk me through an experiment or analysis you ran, from preparation to results. What would you do differently?",
      "Tell me about a time a result was out of specification or did not make sense. What did you do?",
      "How do you make sure your work is documented so someone else could repeat it?",
      "Which instruments and techniques have you used hands-on, and how did you troubleshoot them?",
      "How do you work safely with hazardous chemicals or biological materials?",
      "Tell me about a time you had many samples or deadlines at once. How did you plan the work?",
    ],
    focus: [
      "working to SOPs under Good Laboratory and Manufacturing Practice (GLP, GMP), and what to do when an SOP does not fit the situation",
      "data integrity and documentation: ALCOA+, lab notebooks and electronic records (21 CFR Part 11)",
      "an out-of-specification or unexpected result: checking the sample, the method and the instrument before any retest",
      "analytical methods of the field (HPLC, GC, spectroscopy, PCR or ELISA) and method validation: accuracy, precision, linearity, LOD and LOQ",
      "aseptic technique, contamination control and cell culture or microbiology basics",
      "lab safety: chemical and biological hazards, safety data sheets, waste, and the Israeli Dangerous Substances regulations",
      "calibration and maintenance of instruments, and traceability of samples and reagents",
      "experimental design: controls, replicates and reading results critically",
    ],
  },
  {
    id: "regulatory",
    label: "Regulatory affairs and quality in life sciences",
    // Also matched in matchRoleFamilies for a quality title in a medical,
    // pharma or biotech context, such as "QA Specialist (GMP)".
    keywords: [
      "regulatory affairs",
      "regulatory specialist",
      "regulatory associate",
      "regulatory manager",
      "ra specialist",
      "ra manager",
      "ra associate",
      "qa ra",
      "ra qa",
      "qara",
      "gmp",
      "gxp",
      "pharmacovigilance",
      "drug safety",
      "qualified person",
    ],
    hebrew: [
      // Software QA titles say תוכנה, and are matched as software first.
      "אבטחת איכות",
      "רגולציה ו?אבטחת איכות",
      "רגולציה (רפואית|של תרופות|מכשור רפואי)",
      "רוקח(ת)? (ממונה|אחראי(ת)?)",
      "פרמקוביג'?ילנס",
      "בטיחות תרופות",
    ],
    questions: [
      "Tell me about a deviation or a complaint you investigated. How did you find the root cause and close the CAPA?",
      "How would you prepare for an inspection by the FDA, a notified body or the Israeli Ministry of Health?",
      "Tell me about a time you had to stop a release that was not compliant. How did you handle the pressure?",
      "How do you keep up with changes in regulations and standards?",
      "Walk me through a submission, a technical file or a batch release you worked on.",
      "How do you explain a regulatory requirement to engineers or scientists who see it as paperwork?",
    ],
    focus: [
      "quality management systems: ISO 13485 for medical devices, or GMP (EU GMP, 21 CFR 210 and 211) for drugs, as fits the company",
      "deviations, CAPA and root cause, and how to tell whether a CAPA really worked",
      "risk management under ISO 14971, and linking each risk to a design control and a test",
      "change control: which changes need new verification, a notification or a new submission",
      "regulatory pathways: FDA 510(k), De Novo and PMA, CE marking under the EU MDR, and registration in the Israeli Ministry of Health medical device registry (AMAR)",
      "drug registration with the Ministry of Health Pharmaceutical Division, and pharmacovigilance: adverse event reports and their deadlines",
      "audits and inspections: preparing, hosting and answering findings",
      "documents and records: SOPs, batch or device history records, and data integrity",
      "complaint handling and post-market surveillance",
    ],
  },
  {
    id: "clinical",
    label: "Clinical research",
    keywords: [
      "clinical research",
      "clinical trial",
      "clinical study",
      "clinical studies",
      "clinical operations",
      "clinical project manager",
      "clinical data manager",
      "cra",
      "crc",
      "study coordinator",
      "study manager",
      "trial manager",
      "research coordinator",
      "research nurse",
      "medical science liaison",
      "msl",
      "medical writer",
      "medical writing",
      "biostatistician",
      "biostatistics",
    ],
    hebrew: [
      "מחקר(ים)? קליני(ים)?",
      "ניסוי(ים)? קליני(ים)?",
      "מתא(ם|מת) מחקר(ים)?",
      "רכז(ת)? מחקר(ים)?",
      "מלווה מחקר(ים)?",
      "ביוסטטיסטיקאי(ת)?",
      "ביוסטטיסטיקה",
      "כתיבה רפואית",
      "כותב(ת)? רפואי(ת)?",
    ],
    questions: [
      "Walk me through how a participant goes from screening to the end of a study at a site.",
      "What would you do if you found that a participant signed an outdated version of the consent form?",
      "Tell me about a time a site was behind on recruitment or data entry. What did you do?",
      "A serious adverse event is reported to you late on a Thursday. What do you do, and by when?",
      "How do you work with an investigator who has no time for the study?",
      "How do you keep track of many sites, visits and deadlines at once?",
    ],
    focus: [
      "ICH Good Clinical Practice (E6) and the duties of the investigator, the sponsor and the monitor",
      "informed consent: versions, re-consent and vulnerable participants, under the Israeli Ministry of Health procedure for clinical trials in humans and the Helsinki committees",
      "adverse events and serious adverse events: definitions, causality and reporting deadlines",
      "protocol deviations, source data verification and preparing for a monitoring visit or an audit",
      "trial documents: the protocol, the investigator's brochure, the trial master file and case report forms",
      "recruitment and retention of participants, and checking whether a site can run the study",
      "participant privacy and data protection in research, under the Israeli Privacy Protection Law and GDPR where it applies",
      "trial design basics in plain words: phases, randomization, blinding and endpoints",
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
      "security researcher",
      "vulnerability researcher",
      "malware",
      "reverse engineer",
      "red team",
      "appsec",
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
      "support engineer",
      "technical support",
      "database administrator",
      "dba",
    ],
    hebrew: [
      "תמיכה טכנית",
      "מנהל(ת)? רשת",
      "מנהל(ת)? מערכות מידע",
      "סיסטם",
      "הלפדסק",
      "תומך(ת)? טכני(ת)?",
      "מנהל(ת)? מסדי נתונים",
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
    id: "solutions",
    label: "Solutions and pre-sales engineering",
    keywords: [
      "solutions engineer",
      "sales engineer",
      "pre-sales",
      "presales",
      "pre sales",
      "solutions consultant",
      "technical account manager",
      "customer success engineer",
      "implementation specialist",
      "implementation engineer",
      "implementation consultant",
      // Medical device companies' specialists who train and support
      // clinicians on the product.
      "clinical application specialist",
      "clinical applications specialist",
      "application specialist",
      "applications specialist",
      "field clinical specialist",
    ],
    hebrew: [
      "פריסייל",
      "פרי-?סייל",
      "מהנדס(ת)? (פתרונות|מכירות)",
      "מיישם(ת)?",
      "הטמעה",
    ],
    questions: [
      "Walk me through a technical demo you gave. How did you tailor it to the audience?",
      "Tell me about a deal where a technical objection almost lost it. What did you do?",
      "How do you run a proof of concept so it ends in a decision?",
      "How do you split the work with the account executive in a deal?",
      "Tell me about a customer integration that went wrong. How did you fix it?",
      "How do you pass what you hear from customers back to the product team?",
    ],
    focus: [
      "technical discovery: finding the customer's real problem, environment and decision makers",
      "a demo built around the customer's use case, not a feature tour",
      "running a proof of concept with clear success criteria and a deadline",
      "handling technical objections and security reviews",
      "integration architecture: APIs, SSO, data flows and where the product fits",
      "answering RFPs and security questionnaires",
      "working with the account executive on deal strategy",
      "onboarding and implementation after the deal is signed",
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
      "cto",
      "chief technology officer",
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
  const family = (id: string) => roleFamilies.find((f) => f.id === id)!;
  const engineer =
    / engineers? /.test(words) || hebrewWord("מהנדס(ת)?").test(title);
  // A medical device or biomedical engineer designs physical products.
  const technical = isTechnicalRole(title);
  const medtechEngineer = !technical && MEDTECH_ENGINEER.test(title);
  // A QA or quality title in a medical, pharma or biotech company is quality
  // assurance under the regulator, not software testing.
  const regulatory =
    !technical &&
    (matches(family("regulatory")) ||
      (/\b(qa|quality)\b|איכות/i.test(title) && LIFE_SCIENCE.test(title)) ||
      // In Israeli ads a Hebrew regulatory title with no other context, such
      // as "ממונה רגולציה", is usually in pharma, medical devices or food.
      (hebrewWord("רגולציה|רגולטורי(ת)?").test(title) &&
        !/ביטוח|בנק|פיננס|השקעות|אשראי|תקשורת|אנרגיה|insurance|bank|financ/i.test(
          title,
        )));
  const lab =
    matches(family("lab")) &&
    !matches(family("education")) &&
    !/electronic|hardware|\b(rf|pcb)\b|אלקטרוניקה|חומרה/i.test(title);
  const clinical = matches(family("clinical"));
  const lifeScience = lab || regulatory || clinical;
  // A chemist or QC analyst works in a lab, not as a chemical engineer.
  const hardware =
    (matches(family("hardware")) || medtechEngineer) &&
    !(lifeScience && !engineer);
  // A clinical research associate or a lab scientist is not a nurse, unless
  // the title also says so.
  const careGiver = !(
    (lifeScience ||
      medtechEngineer ||
      technical ||
      matches(family("solutions")) ||
      /medical (devices?|equipment)|(ציוד|מכשור) רפואי/i.test(title)) &&
    !(
      /\b(nurse|nursing|physician|doctor|pharmacist)s?\b/i.test(title) ||
      hebrewWord("אח|אחות|סיעוד|רופא(ה)?|רוקח(ת)?").test(title)
    )
  );
  // A regulatory affairs specialist is not a lawyer, unless the title also
  // says so.
  const lawyer =
    !regulatory ||
    /lawyer|attorney|counsel|legal|עורך|עורכת|עו"ד|משפט/i.test(title);
  // A Hebrew "product engineer" designs physical products, not a product
  // manager's work.
  const productEngineer = hebrewWord("(מהנדס(ת)?|הנדסת) מוצר").test(title);
  // An "RTL design engineer" or "mechanical design engineer" designs
  // hardware, not user experiences.
  const hardwareDesigner = hardware && engineer;
  const dataWord = /data|נתונים|דאטה/i.test(title);
  // A SOC or security analyst analyzes alerts and incidents, and a QC analyst
  // or a clinical research associate works in a lab or a trial, not on
  // business data.
  const notDataAnalyst =
    (matches(family("security")) || lifeScience) && !dataWord;
  // A clinical research coordinator coordinates a study, not a project.
  const studyCoordinator =
    clinical && !/project|program|פרויקט|תוכני(ת|ות)/i.test(title);
  return roleFamilies.filter((f) => {
    switch (f.id) {
      case "engineering":
        return isSoftwareFamily(title, words, hardware);
      case "hardware":
        return hardware;
      case "lab":
        return lab;
      case "regulatory":
        return regulatory;
      case "health":
        return careGiver && matches(f);
      case "legal":
        return lawyer && matches(f);
      case "product":
        return !productEngineer && matches(f);
      case "project":
        return !studyCoordinator && matches(f);
      case "design":
        return !hardwareDesigner && matches(f);
      case "data":
        return !notDataAnalyst && matches(f);
      default:
        return matches(f);
    }
  });
}

/**
 * Medical device and biomedical engineers, whose interviews are about
 * design controls, risk and medical safety standards.
 */
const MEDTECH_ENGINEER =
  /(biomedical|medical devices?|medical equipment|clinical|sterilization|\bcqv)\b.*engineer|engineer.*\b(medical|biomedical)\b|מהנדס(ת)?.*(רפואי|ביו-?רפואי)|הנדס(ה|ת) (ביו-?)?רפואי(ת)?/i;

/** Words that set a title in medicine, pharma or biotech. */
const LIFE_SCIENCE =
  /\b(gmp|gxp|glp|pharma\w*|medical|biomedical|clinical|regulatory|biotech\w*|life sciences?)\b|רפואי|רגולציה|תרופות|פארמה|ביוטק/i;

/**
 * Software work, which keeps a software title technical even in a medical
 * or pharma company.
 */
const SOFTWARE_WORK =
  /software|developer|programmer|firmware|embedded|automation|algorithm|computer vision|machine learning|data (engineer|scientist)|bioinformatic|devops|\b(ml|ai|sre|ios|android|web|cloud|frontend|backend|full[- ]?stack)\b|תוכנה|מפתח|מתכנת|אלגוריתמ|אוטומציה|ביואינפורמטיק/i;

/** A title in medicine, pharma or biotech that is not software work. */
function isLifeScienceNonSoftware(title: string): boolean {
  return LIFE_SCIENCE.test(title) && !SOFTWARE_WORK.test(title);
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
  if (isLifeScienceNonSoftware(title)) return false;
  if (BUSINESS_DEVELOPER.test(title)) return false;
  if (NOT_SOFTWARE_ENGINEER.test(title)) return false;
  if (/ (tester|qa) /.test(words) || / testers /.test(words)) return true;
  if (hardware) return false;
  return / engineers? /.test(words) || hebrewWord("מהנדס(ת)?").test(title);
}

const BUSINESS_DEVELOPER = /business develop|פיתוח עסקי|מפתח(ת)? עסקי/i;

/**
 * Engineers whose interviews are not software interviews: pre-sales,
 * support and implementation engineers, and penetration testers.
 */
const NOT_SOFTWARE_ENGINEER =
  /solutions engineer|sales engineer|pre-?sales|support engineer|customer success engineer|implementation engineer|penetration|pen ?tester|מהנדס(ת)? (פתרונות|מכירות|תמיכה)|פריסייל/i;

/**
 * Software roles, whose professional round draws on core
 * engineering topics and whose case round is a system design interview.
 */
export function isTechnicalRole(title: string): boolean {
  // Not every engineer writes software: an electrical or civil engineer gets
  // the questions of their own field.
  // A business developer is a sales role, not a software one.
  if (BUSINESS_DEVELOPER.test(title)) return false;
  // A QA specialist in a pharma plant or an R&D engineer of medical devices
  // is not a software engineer.
  if (isLifeScienceNonSoftware(title)) return false;
  return (
    SOFTWARE_TITLE.test(title) ||
    QUALIFIED_ENGINEER.test(title) ||
    // Hebrew titles, such as "מפתח תוכנה" or "מהנדסת בקאנד".
    /מפתח|מתכנת|תוכנה|בקאנד|פרונטאנד|פולסטאק|דבאופס|הנדסת נתונים|מהנדס(ת)? נתונים|מדע(ן|נית) נתונים|דאטה סיינטיסט|אלגוריתמ|ביואינפורמטיק|קושחה|משובצות|אמבדד|מהנדס(ת)? (בדיקות|אוטומציה)|בודק(ת)? תוכנה|פיתוח(?! (ארגוני|הדרכה|מוצר|קהילה|לקוחות|הון|עסקי))/.test(
      title,
    )
  );
}

/** Titles that name software work on their own. */
const SOFTWARE_TITLE =
  /\b(software|developer|programmer|devops|sre|site reliability|backend|back-end|frontend|front-end|full[- ]?stack|qa|ios|android|data engineer|machine learning|ml engineer|ai engineer|llm engineer|genai engineer|gen ai engineer|ai developer|prompt engineer|mlops|data scientist|computer vision|algorithms?|bioinformatics|bioinformatician|computational biolog(y|ist)|embedded|firmware|tech lead|engineering manager|software architect|solutions architect)\b/i;

/**
 * Words like "web", "cloud" or "automation" mean software only next to an
 * engineering word: a Web Analyst or a Marketing Automation Manager is not a
 * developer.
 */
const QUALIFIED_ENGINEER =
  /\b(web|mobile|cloud|platform|automation|infrastructure|test|r&d|security|network|integration|game|graphics|smart contract|blockchain|privacy|llm|genai)\s+(developer|engineer|architect)s?\b/i;

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
    id: "bioinformatics",
    label: "Bioinformatics",
    pattern: /bioinformatic|computational biolog|ביואינפורמטיק/i,
    topics: [
      "sequencing data and its formats (FASTQ, BAM, VCF): alignment and variant calling",
      "a reproducible pipeline (Snakemake or Nextflow): versions, failures and reruns",
      "quality control of sequencing data, and spotting batch effects",
      "RNA-seq differential expression: normalization, multiple testing and reading the results",
      "statistics for biology: p-values, false discovery rate and sample size",
      "large files and compute: clusters, cloud and memory limits",
      "public databases and reference genomes, and keeping their versions consistent",
      "explaining results to biologists and choosing what to validate in the lab",
    ],
    designProblems: [
      "a pipeline that turns each day's sequencing runs from the lab into variant reports",
      "an RNA-seq analysis service that biologists run on their own experiments",
      "storage and search for 50,000 genomes with their clinical data",
      "a single-cell analysis workflow that must give the same results a year later",
      "a quality dashboard that flags bad samples before analysis",
    ],
  },
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
    // A penetration tester is a security role, not a software tester.
    pattern:
      /\bqa\b|(?<!penetration |pen )\btest(er|ing)?\b|\bautomation\b|בודק(ת)? תוכנה|בדיקות/i,
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
    id: "llm",
    label: "LLM and generative AI applications",
    pattern:
      /\b(llm|genai|gen ai|generative ai|prompt engineer|ai developer|rag)\b|מודלי שפה|בינה מלאכותית יוצרת/i,
    topics: [
      "retrieval-augmented generation: chunking, embeddings, retrieval quality and citing sources",
      "evaluating LLM output: test sets, automatic graders and human review",
      "prompt design and structured outputs that the rest of the system can trust",
      "hallucinations, prompt injection and guardrails",
      "agents and tool use: when to give the model tools and how to keep it on track",
      "latency and cost: model choice, caching, streaming and batching",
      "fine-tuning versus prompting versus retrieval, and when each fits",
      "monitoring an LLM feature in production and handling regressions",
    ],
    designProblems: [
      "a customer support assistant that answers from 50,000 help-center articles",
      "an evaluation pipeline that catches quality regressions before each release",
      "an agent that books meetings by reading email and calendars safely",
      "a contract review tool that flags risky clauses and cites them",
      "a chat feature for millions of users on a strict cost budget",
    ],
  },
  {
    id: "game",
    label: "Game development",
    pattern: /\b(game|games|gaming|unity|unreal|graphics)\b|משחקים/i,
    topics: [
      "the game loop, frame budgets and keeping a steady frame rate",
      "rendering basics: the graphics pipeline, draw calls and shaders",
      "game physics and collision detection",
      "memory and performance on mobile devices and consoles",
      "multiplayer networking: latency, prediction and authoritative servers",
      "entity-component systems and game architecture",
      "working in Unity or Unreal: scenes, assets and scripting",
      "live ops: updates, A/B tests and analytics in a free-to-play game",
    ],
    designProblems: [
      "the multiplayer backend and client sync for a real-time 10-player mobile game",
      "a level-streaming system for an open world on a phone with 3 GB of memory",
      "an in-game economy and store with protection against cheating",
      "a matchmaking service for a competitive game with millions of players",
      "a replay system that records and plays back a match",
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
  seniority: string | null = null,
): string {
  const specialty = techSpecialtyFor(title);
  const problems =
    specialty?.designProblems ??
    (seniority === "Entry level"
      ? juniorSystemDesignProblems
      : systemDesignProblems);
  return sampleBank(problems, 1, random)[0];
}

/**
 * Electrical and electronics specialties. An electrical engineer in chip
 * design is interviewed on very different material from one who designs
 * power grids, so each specialty has its own topics and design problems.
 * The order matters: a title is matched to the first specialty that fits,
 * so the narrow ones come before the general one at the end.
 */
export const engineeringSpecialties: (TechSpecialty & { coding: boolean })[] = [
  {
    id: "verification",
    label: "Chip verification",
    coding: true,
    pattern:
      /design verification|verification engineer|\b(uvm|dv engineer|formal verification)\b|אימות (שבבים|חומרה|לוגי)|מהנדס(ת)? אימות|וריפיקציה/i,
    topics: [
      "building a verification plan from a spec, and measuring progress with functional and code coverage",
      "UVM architecture: agents, sequences, drivers, monitors and the scoreboard",
      "constrained-random stimulus versus directed tests, and when each fits",
      "SystemVerilog assertions for protocol rules and corner cases",
      "debugging a failing simulation from waveforms and logs back to the root cause",
      "verifying clock domain crossings and resets",
      "reference models and checking results against them",
      "deciding when a block is verified enough to sign off",
    ],
    designProblems: [
      "the verification environment for an AXI-connected DMA engine",
      "a coverage plan and testbench for a packet parser with many header types",
      "verifying a multi-clock FIFO and its clock domain crossing",
      "the test strategy for an arbiter shared by eight requesters with priorities",
      "verification of a cache controller's coherence rules",
    ],
  },
  {
    id: "fpga",
    label: "FPGA",
    coding: true,
    pattern: /\b(fpga|vhdl|verilog)\b/i,
    topics: [
      "writing synthesizable RTL: what infers flip-flops, latches and memories",
      "timing closure: setup and hold, constraints and fixing failing paths",
      "clock domain crossing: synchronizers, handshakes and asynchronous FIFOs",
      "FPGA resources: LUTs, DSP blocks, block RAM and how a design maps to them",
      "pipelining to raise clock frequency, and its cost in latency",
      "state machines: encoding, safe recovery and reset strategy",
      "simulation and on-chip debugging (testbenches, integrated logic analyzers)",
      "interfaces such as AXI, DDR and high-speed serial links",
    ],
    designProblems: [
      "an FPGA image-processing pipeline for a 4K camera at 60 frames a second",
      "a UART-to-AXI bridge with error handling",
      "a real-time FIR filter for a 100 MHz sampled signal",
      "packet capture and filtering on a 10 Gb Ethernet link",
      "a motor-control block with PWM generation and fault shutdown",
    ],
  },
  {
    id: "chip",
    label: "Chip design (VLSI)",
    coding: true,
    pattern:
      /\b(vlsi|asic|rtl|chip|silicon|physical design|logic design|digital design engineer|soc design|backend design|dft)\b|שבב|תכנון לוגי/i,
    topics: [
      "RTL design of a datapath and its control logic",
      "static timing analysis: setup, hold, clock skew and false or multicycle paths",
      "low-power design: clock gating, power domains and leakage",
      "clock domain crossing and reset design",
      "area, power and performance trade-offs in micro-architecture",
      "the flow from RTL to tape-out: synthesis, place and route, sign-off",
      "design for test: scan chains and built-in self test",
      "reading a spec and writing a micro-architecture document",
    ],
    designProblems: [
      "the micro-architecture of a pipelined multiply-accumulate unit for an AI accelerator",
      "a round-robin arbiter for eight masters on an on-chip bus",
      "an asynchronous FIFO between two clock domains",
      "a low-power always-on block that wakes the chip on an event",
      "an Ethernet MAC receive path from the PHY to memory",
    ],
  },
  {
    id: "rf",
    label: "RF and microwave",
    coding: false,
    pattern:
      /\b(rf|microwave|antenna|antennas|radar|wireless hardware)\b|אנטנ|מכ"ם|רדאר/i,
    topics: [
      "link budget: transmit power, path loss, antenna gain and receiver sensitivity",
      "noise figure, cascaded noise and dynamic range",
      "impedance matching, S-parameters and the Smith chart",
      "linearity: compression, intermodulation and IP3",
      "filters, mixers and oscillators: phase noise and spurious signals",
      "antenna basics: gain, pattern, bandwidth and placement",
      "measurement: spectrum and network analyzers, and lab debugging",
      "meeting regulatory emission limits and EMC",
    ],
    designProblems: [
      "the receive chain of a 2.4 GHz IoT radio that must reach 500 meters",
      "a front end for a 77 GHz automotive radar",
      "an antenna and matching network for a small wearable device",
      "a satellite ground terminal's transmit path with tight emission limits",
      "the RF section of a cellular modem board that fails its sensitivity test",
    ],
  },
  {
    id: "analog",
    label: "Analog and power electronics",
    coding: false,
    pattern:
      /analog|mixed[- ]signal|power electronics|power supply|power supplies|\b(dc-dc|smps)\b|אנלוג|אלקטרוניקת הספק|ספק(י)? כוח/i,
    topics: [
      "op-amp circuits: gain, bandwidth, offset and stability",
      "switching converters: buck and boost topologies, efficiency and ripple",
      "transistor basics: biasing, MOSFET switching losses and thermal limits",
      "feedback loops and stability: phase margin and compensation",
      "noise sources and grounding in sensitive measurement circuits",
      "ADC and DAC selection: resolution, sampling and anti-aliasing filters",
      "protection: over-current, over-voltage, inrush and ESD",
      "thermal design and component derating for reliability",
    ],
    designProblems: [
      "a 12 V to 3.3 V, 5 A power supply for a battery-powered device",
      "the signal chain for a precision temperature sensor read by a 16-bit ADC",
      "a motor driver for a 48 V e-bike with current limiting",
      "a battery charger and power path for a medical wearable",
      "an isolated power supply that must pass medical safety standards",
    ],
  },
  {
    id: "board",
    label: "Board and hardware design",
    coding: false,
    pattern:
      /\b(board|pcb|hardware) (design|designer|engineer)|\b(pcb|layout engineer|signal integrity|hardware engineer)\b|תכנון כרטיסים|כרטיס(ים)? אלקטרוני|מהנדס(ת)? חומרה|חומרה/i,
    topics: [
      "schematic design: choosing components and reading datasheets critically",
      "PCB layout: stack-up, grounding, return paths and placement",
      "signal integrity on high-speed lines: impedance, reflections and crosstalk",
      "power integrity: decoupling and power distribution",
      "EMC: designing to pass emissions and immunity tests",
      "bring-up and debugging a new board in the lab",
      "design for manufacturing and test, and working with the assembly house",
      "component shortages, second sources and lifecycle",
    ],
    designProblems: [
      "the main board of an IoT gateway with Wi-Fi, LTE and Ethernet",
      "a board with a processor and DDR4 memory that must pass EMC on the first try",
      "a rugged controller board for an industrial machine at 70°C",
      "a sensor board that must run two years on a coin cell",
      "re-designing a board around a processor that went end-of-life",
    ],
  },
  {
    id: "power",
    label: "Power systems and energy",
    coding: false,
    pattern:
      /power systems?|high voltage|substation|\bgrid\b|renewable|solar|photovoltaic|protection engineer|electrical design engineer|מתח (גבוה|עליון)|תחנ(ה|ות)( ה)?משנה|רשת החשמל|חברת החשמל|אנרגי(ה|ות) מתחדש|סולאר|פוטו-?וולטאי|תכנון חשמל|מתכנ(ן|נת) חשמל/i,
    topics: [
      "load calculations, cable sizing and voltage drop",
      "short-circuit calculations and choosing protective devices",
      "protection coordination and selectivity",
      "earthing and safety under the Israeli Electricity Law and its regulations",
      "transformers, power factor and harmonics",
      "solar and storage systems: sizing, inverters and grid connection",
      "reliability and redundancy in a critical facility",
      "commissioning, testing and working with the utility",
    ],
    designProblems: [
      "the electrical supply for a new data center with 2 MW of IT load",
      "a 5 MW solar field with storage and its connection to the grid",
      "the low-voltage distribution of a 20-storey residential building",
      "upgrading a factory whose power factor and harmonics are fined by the utility",
      "the protection scheme for a 22 kV substation feeding an industrial zone",
    ],
  },
  {
    id: "systems",
    label: "Systems engineering",
    coding: false,
    pattern: /\bsystems? engineer(ing)?\b|מהנדס(ת)? מערכת|הנדסת מערכת/i,
    topics: [
      "turning a customer need into system requirements that can be tested",
      "breaking a system into subsystems and defining the interfaces between them",
      "budgets across the system: error, power, weight, latency or link budgets",
      "trade-off studies between architectures, with weighted criteria",
      "integration and test: planning the order and finding where a problem lives",
      "requirements traceability and verification (analysis, inspection, demonstration, test)",
      "reviews along the project (SRR, PDR, CDR) and managing changes",
      "working across software, electronics, mechanics and the customer",
    ],
    designProblems: [
      "a drone that delivers a 2 kg package 10 km in any weather",
      "an electro-optical payload for a small surveillance satellite",
      "a smart traffic light system for a city of 500,000 people",
      "a ventilator that a hospital can trust for weeks without a stop",
      "the upgrade of an existing defense system whose main sensor is being replaced",
    ],
  },
  {
    id: "robotics",
    label: "Robotics and mechatronics",
    coding: false,
    pattern: /robotic|mechatronic|רובוטיקה|מכטרוניקה/i,
    topics: [
      "control loops: PID tuning, stability and dealing with noise and delay",
      "kinematics and motion planning for an arm or a mobile robot",
      "sensors and sensor fusion: encoders, IMUs, cameras, lidar and a Kalman filter",
      "choosing motors, drives and gearing for a load",
      "ROS and the software architecture of a robot",
      "real-time limits and safety stops",
      "calibration and testing a robot in the real world, not only in simulation",
      "integrating mechanics, electronics and software into one product",
    ],
    designProblems: [
      "a warehouse robot that picks boxes from shelves next to people",
      "a robotic arm that sorts recycling on a moving conveyor",
      "a lawn-mowing robot that must stay inside the garden and never hurt a child",
      "a camera gimbal that stays steady on a moving vehicle",
      "an inspection robot that climbs inside pipes",
    ],
  },
  {
    id: "optics",
    label: "Optics and electro-optics",
    coding: false,
    pattern:
      /\b(optical|optics|photonics|electro-?optic(s|al)?|laser)\b|אופטיקה|אופטי(ת)?|פוטוניקה|לייזר/i,
    topics: [
      "first-order optical design: focal length, aperture, field of view and resolution",
      "aberrations and how a lens design corrects them",
      "detectors and sensors: noise, dynamic range and the signal-to-noise budget",
      "tolerancing and alignment for production",
      "optical design tools (Zemax or Code V) and what to check in their results",
      "thermal and mechanical effects on an optical system",
      "light sources and lasers: safety, power and beam quality",
      "measuring and testing optical performance (MTF, wavefront)",
    ],
    designProblems: [
      "a camera lens for a car's lane-keeping system that works from -40°C to 85°C",
      "a thermal imaging system that detects a person at 2 km",
      "an optical module for an AR headset that must weigh under 50 grams",
      "a lidar for a delivery robot on a tight cost target",
      "an inspection system that finds 10-micron defects on a production line",
    ],
  },
  {
    id: "medical",
    label: "Medical device engineering",
    coding: false,
    pattern: MEDTECH_ENGINEER,
    topics: [
      "design controls: user needs, design inputs and outputs, verification versus validation, and the design history file",
      "risk management under ISO 14971: hazards, risk controls and residual risk",
      "electrical safety and EMC of medical equipment (IEC 60601-1 and 60601-1-2)",
      "usability engineering (IEC 62366) and use errors",
      "biocompatibility (ISO 10993), sterilization and cleaning validation",
      "software in a medical device (IEC 62304) and cybersecurity basics",
      "how the regulatory pathway shapes engineering work: FDA 510(k), the EU MDR and the Israeli AMAR registration",
      "process validation (IQ, OQ, PQ) and moving a design into manufacturing",
    ],
    designProblems: [
      "a home blood pressure monitor for elderly users, from user needs to the verification plan",
      "the alarm system of an infusion pump, with the risk analysis behind each alarm",
      "a single-use surgical instrument that must be sterilized and stay sterile on the shelf",
      "a wearable patch that records heart rhythm for 14 days",
      "the IQ, OQ and PQ plan for a new sealing machine on a sterile packaging line",
    ],
  },
  {
    id: "reliability",
    label: "Reliability and quality engineering",
    coding: false,
    pattern:
      /reliability|quality engineer|validation engineer|\b(v&v|hardware test engineer)\b|אמינות|מהנדס(ת)? (איכות|ולידציה)/i,
    topics: [
      "reliability prediction and MTBF, and what the number really means",
      "FMEA: finding failure modes and ranking the risks",
      "root cause analysis on a field failure (8D, 5 whys, fishbone)",
      "accelerated life testing and environmental testing (HALT, thermal, vibration)",
      "statistical process control and process capability",
      "quality systems and standards (ISO 9001, and ISO 13485 or AS9100 where they apply)",
      "verification and validation plans against requirements",
      "working with suppliers on quality problems",
    ],
    designProblems: [
      "the reliability program for a new outdoor product with a 10-year warranty",
      "a field failure rate that tripled after a supplier change",
      "the validation plan for a medical device before submission to the regulator",
      "a test plan that proves a product survives shipping and harsh environments",
      "cutting the scrap rate of a production line from 8% to 2%",
    ],
  },
  {
    id: "mechanical",
    label: "Mechanical engineering",
    coding: false,
    pattern:
      /\bmechanical\b|מהנדס(ת)? מכונות|הנדסת מכונות|מהנדס(ת)? מכני(ת)?|תכנון מכני|מתכנן(ת)? מכני(ת)?/i,
    topics: [
      "stress, strain and choosing a safety factor for a loaded part",
      "material selection: strength, stiffness, weight, cost and the environment",
      "fatigue and why parts break after many cycles below their strength",
      "tolerances, fits and GD&T on a drawing, and their cost in manufacturing",
      "heat transfer: conduction, convection and cooling an electronics box",
      "design for manufacturing: machining, sheet metal, injection molding and 3D printing",
      "fasteners, bearings and choosing a standard part over a custom one",
      "CAD and FEA: what a simulation can and cannot tell you, and checking it by hand",
    ],
    designProblems: [
      "a bracket that holds a 5 kg camera on a vibrating drone arm",
      "a sealed aluminum enclosure for outdoor electronics that dissipates 40 W",
      "a hinge for a laptop lid that must survive 20,000 open and close cycles",
      "a plastic housing for a handheld device that survives a 1.5 m drop",
      "a simple jig that holds parts in place for drilling on a production line",
    ],
  },
  {
    id: "civil",
    label: "Civil and structural engineering",
    coding: false,
    pattern:
      /\b(civil|structural|construction engineer)\b|מהנדס(ת)? (אזרחי(ת)?|בניין|מבנים|ביצוע|קונסטרוקציה)|הנדסה אזרחית|הנדסת בניין|קונסטרוקטור(ית)?/i,
    topics: [
      "loads on a building: dead, live, wind and seismic, and how they combine",
      "reinforced concrete: why the steel is where it is, and cracking",
      "steel structures: beams, columns, buckling and connections",
      "foundations and soil: reading a soil report and choosing a foundation",
      "the Israeli building standards and codes, such as SI 413 for earthquakes",
      "site supervision: quality control, inspections and safety on site",
      "planning and managing a construction schedule, budget and subcontractors",
      "drainage, roads and infrastructure basics",
    ],
    designProblems: [
      "a reinforced concrete slab for a 6 m by 8 m room in a residential building",
      "a steel canopy over a school entrance in a windy coastal city",
      "the foundation of a four-story building on clay soil",
      "a retaining wall 3 m high next to a road",
      "adding a floor on top of an existing 1970s building",
    ],
  },
  {
    id: "electrical",
    label: "Electrical and electronics engineering",
    coding: false,
    pattern:
      /electrical|electronics?\b|electronic engineer|חשמל(?!אי)|אלקטרוניקה/i,
    topics: [
      "circuit analysis done out loud: a resistor network, an RC filter or a transient",
      "op-amps and transistors: how a basic amplifier or switch works",
      "digital logic: gates, flip-flops, state machines and timing",
      "signals: frequency response, sampling and filtering",
      "power: efficiency, heat and choosing a power supply",
      "choosing components from datasheets by specs, cost and availability",
      "lab debugging with an oscilloscope and a multimeter",
      "testing, failure analysis and root cause",
    ],
    designProblems: [
      "a battery-powered device that measures and reports temperature",
      "the control electronics of a smart home appliance",
      "a system that drives and monitors a set of motors safely",
      "the power and protection for a device sold in Europe and the US",
      "an electronic product whose field return rate suddenly tripled",
    ],
  },
];

/**
 * The electrical specialty a title names. Software titles (such as an
 * embedded software engineer) keep the software rounds.
 */
export function engineeringSpecialtyFor(
  title: string,
): (TechSpecialty & { coding: boolean }) | null {
  if (isTechnicalRole(title)) return null;
  return engineeringSpecialties.find((s) => s.pattern.test(title)) ?? null;
}

/**
 * Roles whose case round is a design interview on one problem: software
 * system design, or an electrical engineering design.
 */
export function hasDesignRound(title: string): boolean {
  return isTechnicalRole(title) || engineeringSpecialtyFor(title) !== null;
}

/**
 * Topics for an electrical engineer's professional round: mostly the
 * specialty, plus one general engineering topic (standards, testing,
 * manufacturing). Empty when the title names no electrical field.
 */
export function engineeringTopicsFor(
  title: string,
  count: number,
  random: () => number = Math.random,
): string[] {
  const specialty = engineeringSpecialtyFor(title);
  if (!specialty) return [];
  const general = roleFamilies.find((f) => f.id === "hardware")!.focus ?? [];
  return [
    ...sampleBank(specialty.topics, count - 1, random),
    ...sampleBank(general, 1, random),
  ];
}

/** One design problem for an electrical engineer, in their specialty. */
export function engineeringDesignProblemFor(
  title: string,
  random: () => number = Math.random,
): string | null {
  const specialty = engineeringSpecialtyFor(title);
  return specialty ? sampleBank(specialty.designProblems, 1, random)[0] : null;
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
    /אנליסט(ית)? (דאטה|נתונים)|מדע(ן|נית) נתונים|דאטה סיינטיסט|ביוסטטיסטיק/.test(
      title,
    ) ||
    /\bbiostatistic/i.test(title) ||
    // Chip design, verification and FPGA interviews include writing RTL.
    engineeringSpecialtyFor(title)?.coding === true
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

/** RTL design problems for chip design and FPGA roles. */
export const hdlDesignTopics = [
  "a finite state machine for a simple protocol or controller",
  "a synchronous FIFO with full and empty flags",
  "a counter, timer or PWM generator with enable and reset",
  "a button debouncer or edge detector",
  "a two-flop synchronizer or a handshake across clock domains",
  "a round-robin or fixed-priority arbiter",
  "a shift register, serializer or deserializer",
  "a small ALU or a pipelined arithmetic block",
  "a UART transmitter or receiver",
  "a register file or a simple memory-mapped register block",
];

/** Verification problems for chip verification roles. */
export const hdlVerificationTopics = [
  "a self-checking testbench for a given block, with a reference model",
  "SystemVerilog assertions for a valid/ready handshake or another protocol rule",
  "a scoreboard that compares a DUT's output stream with expected transactions",
  "constrained-random stimulus: a transaction class with constraints for legal and corner cases",
  "functional coverage: covergroups and crosses for a described feature",
  "a bus monitor that turns pin activity into transactions",
  "finding the bug in a short given RTL block by writing the test that exposes it",
];

/** The RTL problems that fit a role: verification work, or design work. */
export function hdlTopicsFor(title: string): string[] {
  return engineeringSpecialtyFor(title)?.id === "verification"
    ? hdlVerificationTopics
    : hdlDesignTopics;
}

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
 * Design problems for juniors and graduates: one service and its data, the
 * size of a first feature at a startup, where the basics done right matter
 * more than global scale.
 */
export const juniorSystemDesignProblems = [
  "a URL shortener for one company's marketing team",
  "the backend of a to-do app with users, lists and reminders",
  "an API for a small library that lends books to its members",
  "a booking system for the meeting rooms of one office",
  "a leaderboard for a mobile game with 10,000 players",
  "a service that sends a daily summary email to each user of an app",
  "the backend of a simple online store with a cart and orders",
  "a feedback form service that saves answers and shows a summary to admins",
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
