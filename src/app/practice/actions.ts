"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { AiError } from "@/lib/ai/client";
import { evaluateInterview } from "@/lib/interview/evaluate";
import { overallScore, readFeedback } from "@/lib/interview/feedback";
import { generateQuestions } from "@/lib/interview/generate";
import { limitMessage } from "@/lib/interview/limits";
import { getUsage } from "@/lib/interview/usage";
import { parseLanguage, validateAnswer } from "@/lib/interview/schema";
import { resumeSchema } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

export type FormState = { error: string | null };

const aiMessages: Record<AiError["reason"], string> = {
  config: "התרגול עדיין לא מוגדר. נסה שוב מאוחר יותר.",
  auth: "התרגול לא זמין כרגע: שירות הבינה המלאכותית לא קיבל את מפתח הגישה.",
  billing: "התרגול לא זמין כרגע: נגמר הקרדיט בחשבון שירות הבינה המלאכותית.",
  unreadable: "לא הצלחנו להכין שאלות לתפקיד הזה. נסה שוב.",
  service: "משהו השתבש בהכנת השאלות. נסה שוב.",
};

const feedbackMessages: Record<AiError["reason"], string> = {
  ...aiMessages,
  unreadable: "לא הצלחנו לתת ציון לתשובות. נסה שוב.",
  service: "משהו השתבש בזמן מתן הציונים. נסה שוב.",
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
  const language = parseLanguage(formData.get("language"));
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: role }] = await Promise.all([
    supabase
      .from("profiles")
      .select("resume_data")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("target_roles")
      .select("id, title, seniority")
      .eq("id", roleId)
      .maybeSingle(),
  ]);
  const usage = await getUsage(supabase);
  if (usage.remaining === 0) return { error: limitMessage(usage) };

  const resume = resumeSchema.safeParse(profile?.resume_data);
  if (!resume.success) {
    return { error: "קודם צריך להוסיף קורות חיים בעמוד הפרופיל." };
  }
  if (!role) return { error: "בחר אחד מהתפקידים שלך." };

  let questions;
  try {
    questions = await generateQuestions(role, resume.data, language);
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
    .insert({ user_id: user.id, target_role_id: role.id })
    .select("id")
    .single();
  if (sessionError || !session) {
    console.error("Creating session failed:", sessionError?.message);
    return { error: "לא הצלחנו לשמור את התרגול. נסה שוב." };
  }

  const { error: questionsError } = await supabase.from("questions").insert(
    questions.map((q, index) => ({
      user_id: user.id,
      session_id: session.id,
      position: index + 1,
      kind: q.kind,
      text: q.text,
    })),
  );
  if (questionsError) {
    console.error("Saving questions failed:", questionsError.message);
    await supabase.from("sessions").delete().eq("id", session.id);
    return { error: "לא הצלחנו לשמור את התרגול. נסה שוב." };
  }

  redirect(`/practice/${session.id}`);
}

/** Saves the answer to one question and moves on to the next. */
export async function submitAnswer(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const questionId = String(formData.get("questionId") ?? "");
  const sessionId = String(formData.get("sessionId") ?? "");
  const answer = validateAnswer(formData.get("answer"));
  if (!answer.ok) return { error: answer.error };

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("answers")
    .insert({ user_id: user.id, question_id: questionId, text: answer.text });
  // 23505 means this question was already answered, e.g. after a double click.
  if (error && error.code !== "23505") {
    console.error("Saving answer failed:", error.message);
    return { error: "לא הצלחנו לשמור את התשובה. נסה שוב." };
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
    await supabase
      .from("sessions")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", sessionId)
      .is("completed_at", null);
    // If scoring fails, the summary page offers to try again.
    await scoreSession(supabase, sessionId);
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
  const { supabase } = await requireUser();
  const result = await scoreSession(supabase, sessionId);
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
): Promise<FormState> {
  const [{ data: session }, { data: rows }] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, target_roles(title, seniority)")
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
  const roleName = role
    ? `${role.title}${role.seniority ? ` (${role.seniority})` : ""}`
    : "Not specified";

  let feedback;
  try {
    feedback = await evaluateInterview(
      roleName,
      items.map((item) => ({ ...item, answer: item.answer!.text })),
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
    return { error: "לא הצלחנו לשמור את המשוב. נסה שוב." };
  }

  await supabase
    .from("sessions")
    .update({ overall_score: overallScore([...feedback.values()]) })
    .eq("id", sessionId);
  return { error: null };
}
