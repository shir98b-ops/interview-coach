import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { limitWindowStart, usageStatus, type UsageStatus } from "./limits";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** How many practice interviews the signed-in user can still start today. */
export async function getUsage(supabase: Supabase): Promise<UsageStatus> {
  // Row level security limits the count to the user's own interviews.
  const { data } = await supabase
    .from("sessions")
    .select("created_at")
    .gt("created_at", limitWindowStart().toISOString());
  return usageStatus((data ?? []).map((row) => new Date(row.created_at)));
}
