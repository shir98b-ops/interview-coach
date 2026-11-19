/** The shape of analytics_report(), the owner's usage and cost totals. */
export interface AnalyticsReport {
  period_days: number;
  generated_at: string;
  users: {
    total: number;
    new_in_period: number;
    active_in_period: number;
    came_back_after_7_days: number;
    active_on_3_or_more_days: number;
  };
  events: Record<string, { count: number; users: number }>;
  answer_methods: Record<string, number>;
  users_by_device: Record<string, number>;
  daily_limit_hits: Record<string, { count: number; users: number }>;
  ai_cost: {
    total_usd: number;
    calls: number;
    paying_users: number;
    median_user_usd: number;
    heaviest_user_usd: number;
  };
  ai_cost_by_action: {
    action: string;
    model: string;
    calls: number;
    avg_input_tokens: number;
    avg_output_tokens: number;
    avg_cost_usd: number;
    total_usd: number;
  }[];
  ai_cost_by_day: { day: string; calls: number; total_usd: number }[];
  owner_tests: { events: number; ai_calls: number; ai_cost_usd: number };
}

export const reportPeriods = [7, 30, 90] as const;

export function parsePeriod(value: unknown): number {
  const days = Number(value);
  return (reportPeriods as readonly number[]).includes(days) ? days : 30;
}

/** Hebrew names for the events and actions, for the owner's page. */
export const eventLabels: Record<string, string> = {
  signup: "הרשמה",
  resume_saved: "שמירת קורות חיים",
  role_added: "הוספת תפקיד יעד",
  interview_started: "התחלת ראיון",
  answer_submitted: "תשובה בראיון",
  interview_completed: "סיום ראיון",
  lesson_answered: "תשובה בשיעור",
  take_home_started: "התחלת מבחן בית",
  take_home_submitted: "הגשת מבחן בית",
  resume_reviewed: "דירוג קורות חיים",
  job_added: "הוספת משרה",
  job_prep_created: "תוכנית הכנה למשרה",
  feedback_sent: "שליחת משוב",
  limit_reached: "הגעה למגבלה היומית",
};

export const actionLabels: Record<string, string> = {
  "resume.extract": "קריאת קורות חיים",
  "resume.review": "דירוג קורות חיים",
  "interview.questions": "כתיבת שאלות לראיון",
  "interview.score": "ציון לראיון",
  "lesson.score": "משוב בשיעור",
  "take_home.write": "כתיבת מבחן בית",
  "take_home.score": "ציון למבחן בית",
  "job.extract": "קריאת מודעת משרה",
  "job.prep": "תוכנית הכנה למשרה",
};

export function usd(value: number): string {
  return `$${value < 1 ? value.toFixed(4) : value.toFixed(2)}`;
}
