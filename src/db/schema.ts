import { sql } from "drizzle-orm";
import {
  integer,
  jsonb,
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
    difficulty: text("difficulty").notNull(),
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
