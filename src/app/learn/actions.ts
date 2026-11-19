"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { AiError } from "@/lib/ai/client";
import { limitWindowStart, usageStatus } from "@/lib/interview/limits";
import { validateAnswer } from "@/lib/interview/schema";
import { evaluateExercise } from "@/lib/learn/exercise";
import {
  DAILY_EXERCISE_LIMIT,
  type ExerciseFeedback,
} from "@/lib/learn/exercise-feedback";
import { getLesson } from "@/lib/learn/lessons";
import { createClient } from "@/lib/supabase/server";
import { hasNoLimits } from "@/lib/auth/no-limits";
import { getSignedInUser } from "@/lib/supabase/user";

export type ExerciseState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "done"; feedback: ExerciseFeedback };

const aiMessages: Record<AiError["reason"], string> = {
  config: "הבדיקה עדיין לא מוגדרת. אפשר לנסות שוב מאוחר יותר.",
  auth: "הבדיקה לא זמינה כרגע: שירות הבינה המלאכותית לא קיבל את מפתח הגישה.",
  billing: "הבדיקה לא זמינה כרגע: נגמר הקרדיט בחשבון שירות הבינה המלאכותית.",
  unreadable: "לא הצלחנו לבדוק את התשובה. אפשר לנסות שוב.",
  service: "משהו השתבש בבדיקת התשובה. אפשר לנסות שוב.",
};

/** Checks a lesson exercise answer and saves it with its feedback. */
export async function submitExercise(
  _prev: ExerciseState,
  formData: FormData,
): Promise<ExerciseState> {
  const lesson = getLesson(String(formData.get("lesson") ?? ""));
  if (!lesson) return { status: "error", error: "השיעור לא נמצא." };

  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/login?next=/learn/${lesson.slug}`);

  const answer = validateAnswer(formData.get("answer"));
  if (!answer.ok) return { status: "error", error: answer.error };

  // Row level security limits the count to the user's own attempts.
  const { data: recent } = await supabase
    .from("lesson_attempts")
    .select("created_at")
    .gt("created_at", limitWindowStart().toISOString());
  const usage = usageStatus(
    (recent ?? []).map((row) => new Date(row.created_at)),
    new Date(),
    DAILY_EXERCISE_LIMIT,
  );
  if (usage.remaining === 0 && !hasNoLimits(user.email)) {
    const hours = usage.hoursUntilNext ?? 1;
    return {
      status: "error",
      error: `הגעת למגבלה של ${usage.limit} תרגילים ביום. אפשר לנסות שוב בעוד כ־${hours === 1 ? "שעה" : `${hours} שעות`}.`,
    };
  }

  let feedback;
  try {
    feedback = await evaluateExercise(lesson, answer.text, user.address);
  } catch (error) {
    if (error instanceof AiError) {
      console.error("Exercise feedback failed:", error.reason, error.message);
      return {
        status: "error",
        error: `${aiMessages[error.reason]} (קוד שגיאה: ${error.code})`,
      };
    }
    throw error;
  }

  const { error } = await supabase.from("lesson_attempts").insert({
    user_id: user.id,
    lesson_slug: lesson.slug,
    answer: answer.text,
    feedback,
  });
  if (error) {
    console.error("Saving lesson attempt failed:", error.message);
    return {
      status: "error",
      error: "לא הצלחנו לשמור את התשובה. אפשר לנסות שוב.",
    };
  }

  refresh();
  return { status: "done", feedback };
}
