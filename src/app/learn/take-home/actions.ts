"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { AiError } from "@/lib/ai/client";
import { limitWindowStart, usageStatus } from "@/lib/interview/limits";
import { parseLanguage } from "@/lib/interview/schema";
import { evaluateTakeHome, generateTakeHome } from "@/lib/take-home/ai";
import {
  DAILY_TAKE_HOME_LIMIT,
  parseDifficulty,
  readBrief,
  takeHomeScore,
  validateSubmission,
} from "@/lib/take-home/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

export type TakeHomeState = { error: string | null };

const aiMessages: Record<AiError["reason"], string> = {
  config: "מבחני הבית עדיין לא מוגדרים. נסה שוב מאוחר יותר.",
  auth: "השירות לא זמין כרגע: שירות הבינה המלאכותית לא קיבל את מפתח הגישה.",
  billing: "השירות לא זמין כרגע: נגמר הקרדיט בחשבון שירות הבינה המלאכותית.",
  unreadable: "לא הצלחנו להכין מבחן בית. נסה שוב.",
  service: "משהו השתבש. נסה שוב.",
};

function aiError(error: AiError, what: string): TakeHomeState {
  console.error(`${what} failed:`, error.reason, error.message);
  return { error: `${aiMessages[error.reason]} (קוד שגיאה: ${error.code})` };
}

async function requireUser(next: string) {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/login?next=${next}`);
  return { supabase, user };
}

/** Writes a new practice take-home for the chosen role and difficulty. */
export async function startTakeHome(
  _prev: TakeHomeState,
  formData: FormData,
): Promise<TakeHomeState> {
  const { supabase, user } = await requireUser("/learn/take-home");
  const difficulty = parseDifficulty(formData.get("difficulty"));
  const language = parseLanguage(formData.get("language"));

  const [{ data: role }, { data: recent }] = await Promise.all([
    supabase
      .from("target_roles")
      .select("id, title, seniority")
      .eq("id", String(formData.get("roleId") ?? ""))
      .maybeSingle(),
    supabase
      .from("take_homes")
      .select("created_at")
      .gt("created_at", limitWindowStart().toISOString()),
  ]);
  if (!role) return { error: "בחר אחד מהתפקידים שלך." };

  const usage = usageStatus(
    (recent ?? []).map((row) => new Date(row.created_at)),
    new Date(),
    DAILY_TAKE_HOME_LIMIT,
  );
  if (usage.remaining === 0) {
    const hours = usage.hoursUntilNext ?? 1;
    return {
      error: `הגעת למגבלה של ${usage.limit} מבחני בית ביום. אפשר להתחיל חדש בעוד כ־${hours === 1 ? "שעה" : `${hours} שעות`}.`,
    };
  }

  let brief;
  try {
    brief = await generateTakeHome(role, difficulty, language);
  } catch (error) {
    if (error instanceof AiError) return aiError(error, "Take-home generation");
    throw error;
  }

  const { data: created, error } = await supabase
    .from("take_homes")
    .insert({
      user_id: user.id,
      target_role_id: role.id,
      difficulty,
      language,
      brief,
    })
    .select("id")
    .single();
  if (error || !created) {
    console.error("Saving take-home failed:", error?.message);
    return { error: "לא הצלחנו לשמור את מבחן הבית. נסה שוב." };
  }
  redirect(`/learn/take-home/${created.id}`);
}

/**
 * Saves the submission if it is new, then scores it. Also used to retry the
 * scoring when it failed the first time.
 */
export async function submitTakeHome(
  _prev: TakeHomeState,
  formData: FormData,
): Promise<TakeHomeState> {
  const id = String(formData.get("id") ?? "");
  const { supabase } = await requireUser(`/learn/take-home/${id}`);

  // Row level security returns nothing for another user's take-home.
  const { data: takeHome } = await supabase
    .from("take_homes")
    .select("id, brief, submission, score, target_roles(title, seniority)")
    .eq("id", id)
    .maybeSingle();
  const brief = readBrief(takeHome?.brief);
  if (!takeHome || !brief) return { error: "מבחן הבית לא נמצא." };
  if (takeHome.score !== null) return { error: null };

  let submission = takeHome.submission as string | null;
  if (!submission) {
    const checked = validateSubmission(formData.get("submission"));
    if (!checked.ok) return { error: checked.error };
    submission = checked.text;
    const { error } = await supabase
      .from("take_homes")
      .update({ submission, submitted_at: new Date().toISOString() })
      .eq("id", id)
      .is("submission", null);
    if (error) {
      console.error("Saving submission failed:", error.message);
      return { error: "לא הצלחנו לשמור את ההגשה. נסה שוב." };
    }
  }

  const role = takeHome.target_roles as unknown as {
    title: string;
    seniority: string | null;
  } | null;
  let feedback;
  try {
    feedback = await evaluateTakeHome(role, brief, submission);
  } catch (error) {
    refresh();
    if (error instanceof AiError) return aiError(error, "Take-home scoring");
    throw error;
  }

  const { error } = await supabase
    .from("take_homes")
    .update({ feedback, score: takeHomeScore(feedback) })
    .eq("id", id);
  if (error) {
    console.error("Saving take-home feedback failed:", error.message);
    return { error: "לא הצלחנו לשמור את המשוב. נסה שוב." };
  }
  refresh();
  return { error: null };
}
