"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { AiError } from "@/lib/ai/client";
import { generateQuestions } from "@/lib/interview/generate";
import { validateAnswer } from "@/lib/interview/schema";
import { resumeSchema } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

export type FormState = { error: string | null };

const aiMessages: Record<AiError["reason"], string> = {
  config: "Interview practice is not set up yet. Please try again later.",
  auth: "Interview practice is not available right now: the AI service did not accept our access key.",
  billing:
    "Interview practice is not available right now: the AI service account is out of credit.",
  unreadable: "We couldn't prepare questions for this role. Please try again.",
  service:
    "Something went wrong while preparing your questions. Please try again.",
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
  const resume = resumeSchema.safeParse(profile?.resume_data);
  if (!resume.success) {
    return { error: "Add your resume on the profile page first." };
  }
  if (!role) return { error: "Choose one of your target roles." };

  let questions;
  try {
    questions = await generateQuestions(role, resume.data);
  } catch (error) {
    if (error instanceof AiError) {
      console.error("Question generation failed:", error.reason, error.message);
      return {
        error: `${aiMessages[error.reason]} (Error code: ${error.code})`,
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
    return { error: "We couldn't save your practice. Please try again." };
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
    return { error: "We couldn't save your practice. Please try again." };
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
    return { error: "We couldn't save your answer. Please try again." };
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
  }

  refresh();
  return { error: null };
}
