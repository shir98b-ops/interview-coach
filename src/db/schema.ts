import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  index,
  boolean,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUid, authUsers, authenticatedRole } from "drizzle-orm/supabase";

/**
 * Every table holds a user_id and a row-level security policy that lets a
 * signed-in user read and write only their own rows. The database enforces
 * this, so a bug in the app cannot leak one user's data to another.
 */
const ownRowsOnly = (table: string) =>
  pgPolicy(`${table}_own_rows`, {
    for: "all",
    to: authenticatedRole,
    using: sql`${authUid} = user_id`,
    withCheck: sql`${authUid} = user_id`,
  });

const userId = () =>
  uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" });

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** Details extracted from the user's resume, after the user reviews them. */
export const profiles = pgTable(
  "profiles",
  {
    userId: userId().primaryKey(),
    fullName: text("full_name"),
    resumePath: text("resume_path"),
    resumeData: jsonb("resume_data"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [ownRowsOnly("profiles")],
).enableRLS();

/** Roles the user is preparing for, such as "Junior Product Manager". */
export const targetRoles = pgTable(
  "target_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    title: text("title").notNull(),
    seniority: text("seniority"),
    createdAt: createdAt(),
  },
  () => [ownRowsOnly("target_roles")],
).enableRLS();

/** One simulated interview. */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    targetRoleId: uuid("target_role_id").references(() => targetRoles.id, {
      onDelete: "set null",
    }),
    /** Set when the interview was built from a specific job posting. */
    jobId: uuid("job_id").references((): AnyPgColumn => jobs.id, {
      onDelete: "set null",
    }),
    /** The interview stage practiced for, such as "hr" or "professional". */
    stage: text("stage"),
    /** The level the user chose, such as "Entry level"; null reads it from the posting or resume. */
    seniority: text("seniority"),
    overallScore: smallint("overall_score"),
    createdAt: createdAt(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  () => [ownRowsOnly("sessions")],
).enableRLS();

/** A question generated for a session. */
export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    kind: text("kind").notNull(),
    text: text("text").notNull(),
    createdAt: createdAt(),
  },
  () => [ownRowsOnly("questions")],
).enableRLS();

/** The user's answer to a question, with rubric scores and feedback. */
export const answers = pgTable(
  "answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    questionId: uuid("question_id")
      .notNull()
      .unique()
      .references(() => questions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    scores: jsonb("scores"),
    feedback: text("feedback"),
    createdAt: createdAt(),
  },
  () => [ownRowsOnly("answers")],
).enableRLS();

/** The user's answer to a lesson's exercise, with its feedback. */
export const lessonAttempts = pgTable(
  "lesson_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    lessonSlug: text("lesson_slug").notNull(),
    answer: text("answer").notNull(),
    feedback: jsonb("feedback"),
    createdAt: createdAt(),
  },
  () => [ownRowsOnly("lesson_attempts")],
).enableRLS();

/** A practice take-home assignment, the user's submission and its feedback. */
export const takeHomes = pgTable(
  "take_homes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    targetRoleId: uuid("target_role_id").references(() => targetRoles.id, {
      onDelete: "set null",
    }),
    /** Set when the take-home was built from a specific job posting. */
    jobId: uuid("job_id").references((): AnyPgColumn => jobs.id, {
      onDelete: "set null",
    }),
    difficulty: text("difficulty").notNull(),
    /** The level the user chose, such as "Entry level"; null reads it from the posting. */
    seniority: text("seniority"),
    language: text("language").notNull(),
    brief: jsonb("brief").notNull(),
    submission: text("submission"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    feedback: jsonb("feedback"),
    score: smallint("score"),
    createdAt: createdAt(),
  },
  () => [ownRowsOnly("take_homes")],
).enableRLS();

/** An AI rating of the user's resume, for a target role or in general. */
export const resumeReviews = pgTable(
  "resume_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    targetRoleId: uuid("target_role_id").references(() => targetRoles.id, {
      onDelete: "set null",
    }),
    roleTitle: text("role_title"),
    score: smallint("score").notNull(),
    feedback: jsonb("feedback").notNull(),
    createdAt: createdAt(),
  },
  () => [ownRowsOnly("resume_reviews")],
).enableRLS();

/** A short message users send from the feedback button. */
export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    message: text("message").notNull(),
    page: text("page"),
    /** The user's optional rating of the app, 1 to 5. */
    rating: smallint("rating"),
    createdAt: createdAt(),
  },
  () => [ownRowsOnly("feedback")],
).enableRLS();

/** A job the user saved or applied to, and where the application stands. */
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    company: text("company").notNull(),
    title: text("title").notNull(),
    link: text("link"),
    /** The job posting text, pasted by the user. Prep and practice use it. */
    description: text("description"),
    status: text("status").notNull().default("applied"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [ownRowsOnly("jobs")],
).enableRLS();

/** A scheduled interview for one of the user's jobs. */
export const interviews = pgTable(
  "interviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMinutes: smallint("duration_minutes").notNull().default(60),
    location: text("location"),
    notes: text("notes"),
    /** After the interview: what they asked and how it went. */
    reflection: text("reflection"),
    createdAt: createdAt(),
  },
  (table) => [
    ownRowsOnly("interviews"),
    index("interviews_user_starts_idx").on(table.userId, table.startsAt),
  ],
).enableRLS();

/** An AI prep plan for one job, built from its posting and the resume. */
export const jobPreps = pgTable(
  "job_preps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    /** Set when the plan is for one stage of the process. */
    interviewId: uuid("interview_id").references(() => interviews.id, {
      onDelete: "cascade",
    }),
    plan: jsonb("plan").notNull(),
    createdAt: createdAt(),
  },
  () => [ownRowsOnly("job_preps")],
).enableRLS();

/**
 * Usage analytics. Users can only add rows about themselves and cannot read
 * them back; only the owner reads them, as totals, through analytics_report().
 * No answers, resumes or other content are stored here, only what was used.
 */
const insertOwnRowsOnly = (table: string) =>
  pgPolicy(`${table}_insert_own`, {
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`${authUid} = user_id`,
  });

/** One call to the AI service: which action, which model, tokens and cost. */
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Cleared when the account is deleted, so cost totals stay correct. */
    userId: uuid("user_id").references(() => authUsers.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    cacheReadTokens: integer("cache_read_tokens").notNull().default(0),
    cacheWriteTokens: integer("cache_write_tokens").notNull().default(0),
    costUsd: numeric("cost_usd", { precision: 12, scale: 6 }).notNull(),
    /** The owner's own test accounts, kept out of the totals. */
    isInternal: boolean("is_internal").notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [
    insertOwnRowsOnly("ai_usage"),
    index("ai_usage_created_idx").on(table.createdAt),
  ],
).enableRLS();

/** Something a user did, such as starting a practice or answering by voice. */
export const productEvents = pgTable(
  "product_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: userId(),
    name: text("name").notNull(),
    /** Small labels only, such as the input method. Never answer text. */
    props: jsonb("props").notNull().default({}),
    /** phone, tablet or desktop, from the browser's user agent. */
    device: text("device"),
    isInternal: boolean("is_internal").notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [
    insertOwnRowsOnly("product_events"),
    index("product_events_created_idx").on(table.createdAt),
  ],
).enableRLS();

/** Accounts allowed to read the analytics report. No policies: API can't touch it. */
export const analyticsAdmins = pgTable("analytics_admins", {
  userId: userId().primaryKey(),
  createdAt: createdAt(),
}).enableRLS();

/**
 * AI summaries of user feedback, saved so the owner can reread them without
 * paying for a new summary. No policies: only admin functions reach it.
 */
export const feedbackDigests = pgTable("feedback_digests", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdBy: uuid("created_by").references(() => authUsers.id, {
    onDelete: "set null",
  }),
  periodDays: integer("period_days").notNull(),
  feedbackCount: integer("feedback_count").notNull(),
  digest: jsonb("digest").notNull(),
  createdAt: createdAt(),
}).enableRLS();
