"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { Address } from "@/lib/address";
import { AiError } from "@/lib/ai/client";
import { evaluateInterview } from "@/lib/interview/evaluate";
import { overallScore, readFeedback } from "@/lib/interview/feedback";
import { generateQuestions } from "@/lib/interview/generate";
import { interviewsForJob, stagesBefore } from "@/lib/jobs/queries";
import {
  historyText,
  interviewKinds,
  parseKind,
  stageFocus,
} from "@/lib/jobs/schema";
import { limitMessage } from "@/lib/interview/limits";
import { getUsage } from "@/lib/interview/usage";
import {
  PREVIOUS_QUESTION_LIMIT,
  isCodingRole,
  previousQuestionList,
} from "@/lib/interview/question-bank";
import { codeAnswerText, parseCodeLanguage } from "@/lib/code/languages";
import {
  MAX_CODE_ANSWER_LENGTH,
  parseLanguage,
  parseMode,
  parseOrganizationType,
  validateAnswer,
} from "@/lib/interview/schema";
import { resumeSchema } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";
import { hasNoLimits } from "@/lib/auth/no-limits";
import { getSignedInUser } from "@/lib/supabase/user";
import { track } from "@/lib/analytics/record";
import { parseAnswerMethod } from "@/lib/analytics/events";

export type FormState = { error: string | null };

const aiMessages: Record<AiError["reason"], string> = {
  config: "התרגול עדיין לא מוגדר. אפשר לנסות שוב מאוחר יותר.",
  auth: "התרגול לא זמין כרגע: שירות הבינה המלאכותית לא קיבל את מפתח הגישה.",
  billing: "התרגול לא זמין כרגע: נגמר הקרדיט בחשבון שירות הבינה המלאכותית.",
  unreadable: "לא הצלחנו להכין שאלות לתפקיד הזה. אפשר לנסות שוב.",
  service: "משהו השתבש בהכנת השאלות. אפשר לנסות שוב.",
};

const feedbackMessages: Record<AiError["reason"], string> = {
  ...aiMessages,
  unreadable: "לא הצלחנו לתת ציון לתשובות. אפשר לנסות שוב.",
  service: "משהו השתבש בזמן מתן הציונים. אפשר לנסות שוב.",
};

async function requireUser() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/practice");
  return { supabase, user };
}

/** Creates a practice interview with questions for the chosen role. */
export async function startPractice(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const roleId = String(formData.get("roleId") ?? "");
  const jobId = String(formData.get("jobId") ?? "");
  const stageKind = formData.get("stage")
    ? parseKind(formData.get("stage"))
    : null;
  const language = parseLanguage(formData.get("language"));
  const requestedMode = parseMode(formData.get("mode"));
  const codeLanguage = parseCodeLanguage(formData.get("codeLanguage"));
  const organization = parseOrganizationType(formData.get("organization"));
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: savedRole }, { data: job }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("resume_data")
        .eq("user_id", user.id)
        .maybeSingle(),
      roleId
        ? supabase
            .from("target_roles")
            .select("id, title, seniority")
            .eq("id", roleId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      jobId
        ? supabase
            .from("jobs")
            .select("id, company, title, description")
            .eq("id", jobId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
  // A practice for a specific job is built from its posting, and for one
  // stage of its process when a stage is chosen.
  const stages =
    job && stageKind ? await interviewsForJob(supabase, job.id) : [];
  const role = job
    ? {
        id: null,
        title: job.title,
        seniority: null,
        job: job.description
          ? { company: job.company, description: job.description }
          : null,
        stage: stageKind
          ? {
              name: interviewKinds[stageKind],
              focus: stageFocus[stageKind],
              history: historyText(stagesBefore(stages, new Date())),
            }
          : null,
      }
    : savedRole;
  const usage = await getUsage(supabase);
  if (usage.remaining === 0 && !hasNoLimits(user.email)) {
    track("limit_reached", { feature: "interview" }, { supabase, user });
    return { error: limitMessage(usage) };
  }

  const resume = resumeSchema.safeParse(profile?.resume_data);
  if (!resume.success) {
    return { error: "קודם צריך להוסיף קורות חיים בעמוד הפרופיל." };
  }
  if (!role) {
    return {
      error: jobId ? "המשרה לא נמצאה." : "צריך לבחור אחד מהתפקידים שלך.",
    };
  }

  // Coding rounds are only for roles that write code.
  const mode =
    requestedMode === "coding" && !isCodingRole(role.title)
      ? "general"
      : requestedMode;

  // Earlier questions for the same job or role, so new ones do not repeat
  // them. Row level security limits this to the user's own interviews.
  const earlier = supabase
    .from("sessions")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(20);
  const { data: earlierSessions } = job
    ? await earlier.eq("job_id", job.id)
    : role.id
      ? await earlier.eq("target_role_id", role.id)
      : { data: [] };
  const sessionIds = (earlierSessions ?? []).map((s) => s.id as string);
  const { data: earlierQuestions } = sessionIds.length
    ? await supabase
        .from("questions")
        .select("text, created_at")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: false })
        .limit(PREVIOUS_QUESTION_LIMIT * 2)
    : { data: [] };
  const previousQuestions = previousQuestionList(
    (earlierQuestions ?? []).map((q) => q.text as string),
  );

  let questions;
  try {
    questions = await generateQuestions(
      { ...role, previousQuestions, mode, organization, codeLanguage },
      resume.data,
      language,
      user.address,
    );
  } catch (error) {
    if (error instanceof AiError) {
      console.error("Question generation failed:", error.reason, error.message);
      return {
        error: `${aiMessages[error.reason]} (קוד שגיאה: ${error.code})`,
      };
    }
    throw error;
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      target_role_id: role.id,
      job_id: job?.id ?? null,
      stage: job ? stageKind : null,
    })
    .select("id")
    .single();
  if (sessionError || !session) {
    console.error("Creating session failed:", sessionError?.message);
    return { error: "לא הצלחנו לשמור את התרגול. אפשר לנסות שוב." };
  }

  const { error: questionsError } = await supabase.from("questions").insert(
    questions.map((q, index) => ({
      user_id: user.id,
      session_id: session.id,
      position: index + 1,
      // A coding question keeps its language, such as "coding:python".
      kind: mode === "coding" ? `coding:${codeLanguage}` : q.kind,
      text: q.text,
    })),
  );
  if (questionsError) {
    console.error("Saving questions failed:", questionsError.message);
    await supabase.from("sessions").delete().eq("id", session.id);
    return { error: "לא הצלחנו לשמור את התרגול. אפשר לנסות שוב." };
  }

  track(
    "interview_started",
    { mode, stage: job ? stageKind : null, fromJob: Boolean(job), language },
    { supabase, user },
  );
  redirect(`/practice/${session.id}`);
}

/** Saves the answer to one question and moves on to the next. */
export async function submitAnswer(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const questionId = String(formData.get("questionId") ?? "");
  const sessionId = String(formData.get("sessionId") ?? "");
  // A coding answer arrives as code plus an optional explanation.
  const answer = formData.has("code")
    ? validateAnswer(
        String(formData.get("code") ?? "").trim() &&
          codeAnswerText(
            parseCodeLanguage(formData.get("codeLanguage")),
            String(formData.get("code") ?? ""),
            String(formData.get("explanation") ?? ""),
          ),
        MAX_CODE_ANSWER_LENGTH,
      )
    : validateAnswer(formData.get("answer"));
  if (!answer.ok) return { error: answer.error };

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("answers")
    .insert({ user_id: user.id, question_id: questionId, text: answer.text });
  // 23505 means this question was already answered, e.g. after a double click.
  if (error && error.code !== "23505") {
    console.error("Saving answer failed:", error.message);
    return { error: "לא הצלחנו לשמור את התשובה. אפשר לנסות שוב." };
  }
  if (!error) {
    const method = formData.has("code")
      ? "code"
      : parseAnswerMethod(formData.get("inputMethod"));
    track("answer_submitted", { method }, { supabase, user });
  }

  // Row level security limits both reads to the user's own rows.
  const { data: questions } = await supabase
    .from("questions")
    .select("id, answers(id)")
    .eq("session_id", sessionId);
  // The answer comes back as an object or a list, depending on the relation.
  const answered = (value: unknown) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value);
  const allAnswered =
    Boolean(questions?.length) && questions!.every((q) => answered(q.answers));
  if (allAnswered) {
    const { data: completed } = await supabase
      .from("sessions")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", sessionId)
      .is("completed_at", null)
      .select("id");
    if (completed?.length) {
      track("interview_completed", {}, { supabase, user });
    }
    // If scoring fails, the summary page offers to try again.
    await scoreSession(supabase, sessionId, user.address);
  }

  refresh();
  return { error: null };
}

/** Scores a finished interview again, for when the first try failed. */
export async function retryFeedback(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const sessionId = String(formData.get("sessionId") ?? "");
  const { supabase, user } = await requireUser();
  const result = await scoreSession(supabase, sessionId, user.address);
  if (result.error) return result;
  refresh();
  return { error: null };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

const one = <T>(value: T | T[] | null): T | null =>
  Array.isArray(value) ? (value[0] ?? null) : value;

/** Scores every answer of a finished interview and saves the feedback. */
async function scoreSession(
  supabase: Supabase,
  sessionId: string,
  address: Address | null,
): Promise<FormState> {
  const [{ data: session }, { data: rows }] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, target_roles(title, seniority), jobs(title, company)")
      .eq("id", sessionId)
      .maybeSingle(),
    supabase
      .from("questions")
      .select("id, position, kind, text, answers(id, text, scores)")
      .eq("session_id", sessionId)
      .order("position"),
  ]);
  if (!session || !rows?.length) return { error: "התרגול לא נמצא." };

  const items = rows.map((row) => ({
    questionId: row.id as string,
    position: row.position as number,
    kind: row.kind as string,
    question: row.text as string,
    answer: one(
      row.answers as
        | { text: string; scores: unknown }
        | { text: string; scores: unknown }[]
        | null,
    ),
  }));
  if (items.some((item) => !item.answer)) {
    return { error: "קודם צריך לענות על כל השאלות." };
  }
  if (items.every((item) => readFeedback(item.answer!.scores))) {
    return { error: null };
  }

  const role = one(
    session.target_roles as unknown as {
      title: string;
      seniority: string | null;
    } | null,
  );
  const job = one(
    session.jobs as unknown as { title: string; company: string } | null,
  );
  const roleName = job
    ? `${job.title} at ${job.company}`
    : role
      ? `${role.title}${role.seniority ? ` (${role.seniority})` : ""}`
      : "Not specified";

  let feedback;
  try {
    feedback = await evaluateInterview(
      roleName,
      items.map((item) => ({ ...item, answer: item.answer!.text })),
      address,
    );
  } catch (error) {
    if (error instanceof AiError) {
      console.error("Scoring failed:", error.reason, error.message);
      return {
        error: `${feedbackMessages[error.reason]} (קוד שגיאה: ${error.code})`,
      };
    }
    throw error;
  }

  const results = await Promise.all(
    items.map((item) => {
      const f = feedback.get(item.position)!;
      return supabase
        .from("answers")
        .update({ scores: f, feedback: f.improvements })
        .eq("question_id", item.questionId);
    }),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    console.error("Saving feedback failed:", failed.error.message);
    return { error: "לא הצלחנו לשמור את המשוב. אפשר לנסות שוב." };
  }

  await supabase
    .from("sessions")
    .update({ overall_score: overallScore([...feedback.values()]) })
    .eq("id", sessionId);
  return { error: null };
}
