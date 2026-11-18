"use server";

import { refresh } from "next/cache";
import { AiError } from "@/lib/ai/client";
import { limitWindowStart, usageStatus } from "@/lib/interview/limits";
import { writePrepPlan } from "@/lib/jobs/prep";
import { DAILY_PREP_LIMIT, validateDescription } from "@/lib/jobs/prep-schema";
import { resumeSchema } from "@/lib/resume/schema";
import { redirect } from "next/navigation";
import {
  parseDuration,
  parseKind,
  parseStatus,
  validateJob,
} from "@/lib/jobs/schema";
import { daysUntil, fromLocalInput } from "@/lib/jobs/time";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

export type JobFormState = { error: string | null };

async function requireUser(next = "/jobs") {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { supabase, user };
}

const optional = (value: FormDataEntryValue | null, max: number) => {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, max) : null;
};

/** Adds a job and opens its page. */
export async function addJob(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const checked = validateJob(formData);
  if (!checked.ok) return { error: checked.error };

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("jobs")
    .insert({ user_id: user.id, ...checked.value })
    .select("id")
    .single();
  if (error || !data) {
    console.error("Adding job failed:", error?.message);
    return { error: "לא הצלחנו לשמור את המשרה. אפשר לנסות שוב." };
  }
  redirect(`/jobs/${data.id}`);
}

/** Saves a job's status and notes. */
export async function updateJob(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase } = await requireUser(`/jobs/${id}`);
  // Row level security limits the update to the user's own jobs.
  const { error } = await supabase
    .from("jobs")
    .update({
      status: parseStatus(formData.get("status")),
      notes: optional(formData.get("notes"), 4000),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("Updating job failed:", error.message);
  refresh();
}

/** Deletes a job and its interviews. */
export async function deleteJob(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase } = await requireUser();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) console.error("Deleting job failed:", error.message);
  redirect("/jobs");
}

/** Schedules an interview for one of the user's jobs. */
export async function addInterview(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const jobId = String(formData.get("jobId") ?? "");
  const startsAt = fromLocalInput(formData.get("startsAt"));
  if (!startsAt) return { error: "צריך לבחור תאריך ושעה." };

  const { supabase, user } = await requireUser(`/jobs/${jobId}`);
  // Confirms the job is the user's own before linking an interview to it.
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("id", jobId)
    .maybeSingle();
  if (!job) return { error: "המשרה לא נמצאה." };

  const { error } = await supabase.from("interviews").insert({
    user_id: user.id,
    job_id: job.id,
    kind: parseKind(formData.get("kind")),
    starts_at: startsAt.toISOString(),
    duration_minutes: parseDuration(formData.get("duration")),
    location: optional(formData.get("location"), 500),
    notes: optional(formData.get("notes"), 2000),
  });
  if (error) {
    console.error("Adding interview failed:", error.message);
    return { error: "לא הצלחנו לשמור את הראיון. אפשר לנסות שוב." };
  }
  // A scheduled interview means the process has started.
  if (job.status === "saved" || job.status === "applied") {
    await supabase
      .from("jobs")
      .update({ status: "interviewing", updated_at: new Date().toISOString() })
      .eq("id", job.id);
  }
  refresh();
  return { error: null };
}

export async function deleteInterview(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase } = await requireUser();
  const { error } = await supabase.from("interviews").delete().eq("id", id);
  if (error) console.error("Deleting interview failed:", error.message);
  refresh();
}

/** Saves the pasted job posting. */
export async function saveDescription(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const id = String(formData.get("id") ?? "");
  const checked = validateDescription(formData.get("description"));
  if (!checked.ok) return { error: checked.error };

  const { supabase } = await requireUser(`/jobs/${id}`);
  const { error } = await supabase
    .from("jobs")
    .update({ description: checked.text, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("Saving job description failed:", error.message);
    return { error: "לא הצלחנו לשמור את התיאור. אפשר לנסות שוב." };
  }
  refresh();
  return { error: null };
}

const prepMessages: Record<AiError["reason"], string> = {
  config: "תוכנית ההכנה עדיין לא מוגדרת. אפשר לנסות שוב מאוחר יותר.",
  auth: "תוכנית ההכנה לא זמינה כרגע: שירות הבינה המלאכותית לא קיבל את מפתח הגישה.",
  billing:
    "תוכנית ההכנה לא זמינה כרגע: נגמר הקרדיט בחשבון שירות הבינה המלאכותית.",
  unreadable: "לא הצלחנו לבנות תוכנית מהמודעה הזו. אפשר לנסות שוב.",
  service: "משהו השתבש בבניית התוכנית. אפשר לנסות שוב.",
};

/** Builds a prep plan for the job from its posting and the resume. */
export async function createPrepPlan(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const id = String(formData.get("id") ?? "");
  const { supabase, user } = await requireUser(`/jobs/${id}`);
  const now = new Date();

  const [{ data: job }, { data: profile }, { data: recent }, { data: next }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("id, company, title, description")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("resume_data")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("job_preps")
        .select("created_at")
        .gt("created_at", limitWindowStart(now).toISOString()),
      supabase
        .from("interviews")
        .select("starts_at")
        .eq("job_id", id)
        .gte("starts_at", now.toISOString())
        .order("starts_at")
        .limit(1)
        .maybeSingle(),
    ]);

  if (!job) return { error: "המשרה לא נמצאה." };
  if (!job.description) {
    return { error: "קודם צריך להדביק את תיאור המשרה." };
  }
  const resume = resumeSchema.safeParse(profile?.resume_data);
  if (!resume.success) {
    return { error: "קודם צריך להעלות קורות חיים בעמוד הפרופיל." };
  }
  const usage = usageStatus(
    (recent ?? []).map((row) => new Date(row.created_at)),
    now,
    DAILY_PREP_LIMIT,
  );
  if (usage.remaining === 0) {
    const hours = usage.hoursUntilNext ?? 1;
    return {
      error: `הגעת למגבלה של ${usage.limit} תוכניות ביום. אפשר שוב בעוד כ־${hours === 1 ? "שעה" : `${hours} שעות`}.`,
    };
  }

  let plan;
  try {
    plan = await writePrepPlan(
      { company: job.company, title: job.title, description: job.description },
      resume.data,
      next ? daysUntil(new Date(next.starts_at), now) : null,
      user.address,
    );
  } catch (error) {
    if (error instanceof AiError) {
      console.error("Prep plan failed:", error.reason, error.message);
      return {
        error: `${prepMessages[error.reason]} (קוד שגיאה: ${error.code})`,
      };
    }
    throw error;
  }

  const { error } = await supabase
    .from("job_preps")
    .insert({ user_id: user.id, job_id: job.id, plan });
  if (error) {
    console.error("Saving prep plan failed:", error.message);
    return { error: "לא הצלחנו לשמור את התוכנית. אפשר לנסות שוב." };
  }
  refresh();
  return { error: null };
}
