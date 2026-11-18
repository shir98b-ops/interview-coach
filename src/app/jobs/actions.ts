"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseDuration,
  parseKind,
  parseStatus,
  validateJob,
} from "@/lib/jobs/schema";
import { fromLocalInput } from "@/lib/jobs/time";
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
