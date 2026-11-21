/**
 * The one "next step" the home screen offers. An upcoming interview comes
 * first; otherwise the steps follow the order that helps most right now:
 * set up (resume, role, first interview), then each kind of round, then a
 * started take-home, a weak resume, and finally a short lesson.
 */

import type { IconName } from "@/components/ui";

export type StepTone = "blue" | "sky" | "lavender" | "mint" | "pink" | "sun";

export interface NextStep {
  key: string;
  /** The small label above the title. */
  chip: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  icon: IconName;
  tone: StepTone;
  /** Set-up progress for new users: step n of 3. */
  setup?: { step: number; total: number };
  /** Prep progress before an interview. */
  prep?: { done: number; total: number };
}

export interface HomeFacts {
  hasResume: boolean;
  roleTitle: string | null;
  /** Round kinds already practiced: general, technical, design, coding. */
  roundsDone: Set<string>;
  technicalRole: boolean;
  codingRole: boolean;
  /** Score of the latest resume review, if any. */
  resumeScore: number | null;
  /** A take-home that was started but not yet submitted. */
  openTakeHome: { id: string } | null;
  upcoming: {
    jobId: string;
    company: string;
    kindLabel: string;
    days: number;
    whenText: string;
    practicesForJob: number;
  } | null;
  lesson: { slug: string; title: string; minutes: number } | null;
}

/** Practices before an interview that count as being prepared. */
export const PREP_GOAL = 3;

const SETUP_TOTAL = 3;

export function nextStep(facts: HomeFacts): NextStep {
  const role = facts.roleTitle ?? "";

  if (facts.upcoming) {
    const u = facts.upcoming;
    return {
      key: "interview",
      chip:
        u.days <= 0
          ? "ראיון היום"
          : u.days === 1
            ? "ראיון מחר"
            : `ראיון בעוד ${u.days} ימים`,
      title: `הכנה ל${u.company}`,
      subtitle: `${u.kindLabel} · ${u.whenText}`,
      cta: "להמשיך",
      href: `/jobs/${u.jobId}`,
      icon: "calendar",
      tone: "sun",
      prep: {
        done: Math.min(u.practicesForJob, PREP_GOAL),
        total: PREP_GOAL,
      },
    };
  }

  if (!facts.hasResume) {
    return {
      key: "resume",
      chip: `צעד 1 מתוך ${SETUP_TOTAL}`,
      title: "נתחיל מקורות החיים",
      subtitle: "השאלות יותאמו לניסיון שלך. לוקח דקה.",
      cta: "להעלות קורות חיים",
      href: "/profile",
      icon: "page",
      tone: "lavender",
      setup: { step: 1, total: SETUP_TOTAL },
    };
  }

  if (!facts.roleTitle) {
    return {
      key: "role",
      chip: `צעד 2 מתוך ${SETUP_TOTAL}`,
      title: "לבחור תפקיד",
      subtitle: "לאיזה תפקיד מתכוננים? השאלות ייבנו לפיו.",
      cta: "לבחור",
      href: "/profile",
      icon: "target",
      tone: "sky",
      setup: { step: 2, total: SETUP_TOTAL },
    };
  }

  const practice = (mode: string) => `/practice?mode=${mode}`;
  const done = facts.roundsDone;

  if (done.size === 0) {
    return {
      key: "intro",
      chip: `צעד 3 מתוך ${SETUP_TOTAL}`,
      title: "ראיון היכרות",
      subtitle: `${role} · חמש שאלות · רבע שעה`,
      cta: "להתחיל",
      href: practice("general"),
      icon: "speech",
      tone: "mint",
      setup: { step: 3, total: SETUP_TOTAL },
    };
  }

  const professional = {
    key: "professional",
    chip: "הצעד הבא שלך",
    title: "תרגול ראיון מקצועי",
    subtitle: `${role} · חמש שאלות · רבע שעה`,
    cta: "להתחיל",
    href: practice("professional"),
    icon: "briefcase",
    tone: "blue",
  } satisfies NextStep;

  if (!done.has("technical")) return professional;

  if (facts.technicalRole) {
    if (facts.codingRole && !done.has("coding")) {
      return {
        key: "technical",
        chip: "הצעד הבא שלך",
        title: "ראיון טכני",
        subtitle: `${role} · שתי בעיות קוד`,
        cta: "להתחיל",
        href: practice("coding"),
        icon: "laptop",
        tone: "sky",
      };
    }
  } else if (!done.has("design")) {
    return {
      key: "case",
      chip: "הצעד הבא שלך",
      title: "ניתוח מקרה",
      subtitle: `${role} · מקרה אחד, שלב אחרי שלב`,
      cta: "להתחיל",
      href: practice("case"),
      icon: "puzzle",
      tone: "pink",
    };
  }

  if (facts.openTakeHome) {
    return {
      key: "take-home",
      chip: "יש לך מטלה",
      title: "מטלת בית",
      subtitle: "התחלת מטלה. אפשר להמשיך מאיפה שעצרת.",
      cta: "לפתוח",
      href: `/learn/take-home/${facts.openTakeHome.id}`,
      icon: "clipboard",
      tone: "lavender",
    };
  }

  if (facts.resumeScore !== null && facts.resumeScore < 70) {
    return {
      key: "improve-resume",
      chip: "כדאי לשפר",
      title: "לחזק את קורות החיים",
      subtitle: `הציון האחרון ${facts.resumeScore}. יש כמה תיקונים מהירים.`,
      cta: "לשפר",
      href: "/profile/review",
      icon: "memo",
      tone: "mint",
    };
  }

  if (facts.lesson) {
    return {
      key: "lesson",
      chip: "שיעור קצר",
      title: facts.lesson.title,
      subtitle: `${facts.lesson.minutes} דקות`,
      cta: "ללמוד",
      href: `/learn/${facts.lesson.slug}`,
      icon: "bulb",
      tone: "pink",
    };
  }

  return professional;
}
