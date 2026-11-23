"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { AiError } from "@/lib/ai/client";
import { limitWindowStart, usageStatus } from "@/lib/interview/limits";
import { parseCodeLanguage } from "@/lib/code/languages";
import { isCodingRole } from "@/lib/interview/question-bank";
import { parseLanguage } from "@/lib/interview/schema";
import { evaluateTakeHome, generateTakeHome } from "@/lib/take-home/ai";
import {
  DAILY_TAKE_HOME_LIMIT,
  parseDifficulty,
  parseFormat,
  readBrief,
  takeHomeScore,
  validateSubmission,
} from "@/lib/take-home/schema";
import { createClient } from "@/lib/supabase/server";
import { hasNoLimits } from "@/lib/auth/no-limits";
import { getSignedInUser } from "@/lib/supabase/user";
import { track } from "@/lib/analytics/record";
import { parseSeniority } from "@/lib/format";

export type TakeHomeState = { error: string | null };

const aiMessages: Record<AiError["reason"], string> = {
  config: "מבחני הבית עדיין לא מוגדרים. אפשר לנסות שוב מאוחר יותר.",
  auth: "השירות לא זמין כרגע: שירות הבינה המלאכותית לא קיבל את מפתח הגישה.",
  billing: "השירות לא זמין כרגע: נגמר הקרדיט בחשבון שירות הבינה המלאכותית.",
  unreadable: "לא הצלחנו להכין מבחן בית. אפשר לנסות שוב.",
  service: "משהו השתבש. אפשר לנסות שוב.",
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
  const requestedFormat = parseFormat(formData.get("format"));
  const codeLanguage = parseCodeLanguage(formData.get("codeLanguage"));
  const chosenLevel = parseSeniority(formData.get("seniority"));

  const jobId = String(formData.get("jobId") ?? "");
  const [{ data: savedRole }, { data: job }, { data: recent }] =
    await Promise.all([
      supabase
        .from("target_roles")
        .select("id, title, seniority")
        .eq("id", String(formData.get("roleId") ?? ""))
        .maybeSingle(),
      jobId
        ? supabase
            .from("jobs")
            .select("id, company, title, description")
            .eq("id", jobId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("take_homes")
        .select("created_at")
        .gt("created_at", limitWindowStart().toISOString()),
    ]);
  // A take-home for a specific job is built around its posting.
  const role = job
    ? {
        id: null,
        title: job.title,
        seniority: chosenLevel,
        job: job.description
          ? { company: job.company, description: job.description }
          : null,
      }
    : savedRole && { ...savedRole, seniority: chosenLevel };
  if (!role) {
    return {
      error: jobId ? "המשרה לא נמצאה." : "צריך לבחור אחד מהתפקידים שלך.",
    };
  }

  const usage = usageStatus(
    (recent ?? []).map((row) => new Date(row.created_at)),
    new Date(),
    DAILY_TAKE_HOME_LIMIT,
  );
  if (usage.remaining === 0 && !hasNoLimits(user.email)) {
    track("limit_reached", { feature: "take_home" }, { supabase, user });
    const hours = usage.hoursUntilNext ?? 1;
    return {
      error: `הגעת למגבלה של ${usage.limit} מבחני בית ביום. אפשר להתחיל חדש בעוד כ־${hours === 1 ? "שעה" : `${hours} שעות`}.`,
    };
  }

  // Code take-homes are only for roles that write code.
  const format =
    requestedFormat === "code" && isCodingRole(role.title)
      ? "code"
      : "document";

  let brief;
  try {
    brief = await generateTakeHome(
      role,
      difficulty,
      language,
      user.address,
      format,
      codeLanguage,
    );
  } catch (error) {
    if (error instanceof AiError) return aiError(error, "Take-home generation");
    throw error;
  }

  const { data: created, error } = await supabase
    .from("take_homes")
    .insert({
      user_id: user.id,
      target_role_id: role.id,
      job_id: job?.id ?? null,
      difficulty,
      seniority: role.seniority,
      language,
      brief,
    })
    .select("id")
    .single();
  if (error || !created) {
    console.error("Saving take-home failed:", error?.message);
    return { error: "לא הצלחנו לשמור את מבחן הבית. אפשר לנסות שוב." };
  }
  track(
    "take_home_started",
    { format: brief.format ?? "document", difficulty, fromJob: Boolean(job) },
    { supabase, user },
  );
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
  const { supabase, user } = await requireUser(`/learn/take-home/${id}`);

  // Row level security returns nothing for another user's take-home.
  const { data: takeHome } = await supabase
    .from("take_homes")
    .select(
      "id, brief, submission, score, seniority, target_roles(title, seniority), jobs(title, company)",
    )
    .eq("id", id)
    .maybeSingle();
  const brief = readBrief(takeHome?.brief);
  if (!takeHome || !brief) return { error: "מבחן הבית לא נמצא." };
  if (takeHome.score !== null) return { error: null };

  let submission = takeHome.submission as string | null;
  if (!submission) {
    const checked = validateSubmission(
      formData.get("submission"),
      brief.format,
    );
    if (!checked.ok) return { error: checked.error };
    submission = checked.text;
    const { error } = await supabase
      .from("take_homes")
      .update({ submission, submitted_at: new Date().toISOString() })
      .eq("id", id)
      .is("submission", null);
    if (error) {
      console.error("Saving submission failed:", error.message);
      return { error: "לא הצלחנו לשמור את ההגשה. אפשר לנסות שוב." };
    }
  }

  const savedRole = takeHome.target_roles as unknown as {
    title: string;
    seniority: string | null;
  } | null;
  const job = takeHome.jobs as unknown as {
    title: string;
    company: string;
  } | null;
  // Scored at the level it was written for; older take-homes use the role's.
  const seniority = parseSeniority(takeHome.seniority ?? savedRole?.seniority);
  const role = job
    ? { title: `${job.title} at ${job.company}`, seniority }
    : savedRole && { title: savedRole.title, seniority };
  let feedback;
  try {
    feedback = await evaluateTakeHome(role, brief, submission, user.address);
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
    return { error: "לא הצלחנו לשמור את המשוב. אפשר לנסות שוב." };
  }
  track(
    "take_home_submitted",
    { format: brief.format ?? "document" },
    { supabase, user },
  );
  refresh();
  return { error: null };
}
