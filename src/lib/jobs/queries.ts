import type { createClient } from "@/lib/supabase/server";
import { parseKind, type InterviewKind } from "./schema";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface InterviewRow {
  id: string;
  jobId: string;
  company: string;
  title: string;
  kind: InterviewKind;
  startsAt: Date;
  minutes: number;
  location: string | null;
  notes: string | null;
}

const columns =
  "id, job_id, kind, starts_at, duration_minutes, location, notes, jobs(company, title)";

type Raw = {
  id: string;
  job_id: string;
  kind: string;
  starts_at: string;
  duration_minutes: number;
  location: string | null;
  notes: string | null;
  jobs:
    | { company: string; title: string }
    | { company: string; title: string }[]
    | null;
};

function toRow(raw: Raw): InterviewRow {
  const job = Array.isArray(raw.jobs) ? raw.jobs[0] : raw.jobs;
  return {
    id: raw.id,
    jobId: raw.job_id,
    company: job?.company ?? "",
    title: job?.title ?? "",
    kind: parseKind(raw.kind),
    startsAt: new Date(raw.starts_at),
    minutes: raw.duration_minutes,
    location: raw.location,
    notes: raw.notes,
  };
}

/** The user's interviews from the start of today on, soonest first. */
export async function upcomingInterviews(
  supabase: Supabase,
  now: Date,
  limit = 20,
): Promise<InterviewRow[]> {
  // Keeps interviews from earlier today, so today's list stays complete.
  const from = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const { data } = await supabase
    .from("interviews")
    .select(columns)
    .gte("starts_at", from.toISOString())
    .order("starts_at")
    .limit(limit);
  return ((data ?? []) as unknown as Raw[]).map(toRow);
}

/** Every interview of one job, in order. */
export async function interviewsForJob(
  supabase: Supabase,
  jobId: string,
): Promise<InterviewRow[]> {
  const { data } = await supabase
    .from("interviews")
    .select(columns)
    .eq("job_id", jobId)
    .order("starts_at");
  return ((data ?? []) as unknown as Raw[]).map(toRow);
}

export async function interviewById(
  supabase: Supabase,
  id: string,
): Promise<InterviewRow | null> {
  const { data } = await supabase
    .from("interviews")
    .select(columns)
    .eq("id", id)
    .maybeSingle();
  return data ? toRow(data as unknown as Raw) : null;
}
