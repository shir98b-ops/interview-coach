"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toAiError } from "@/lib/ai/client";
import { digestFeedback } from "@/lib/feedback/digest";
import type { FeedbackItem } from "@/lib/feedback/schema";
import { parsePeriod } from "@/lib/analytics/report";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

export type DigestState = { status: "idle" | "error"; error?: string };

/** Asks the AI for a new summary of the period's feedback and saves it. */
export async function summarizeFeedback(
  _prev: DigestState,
  formData: FormData,
): Promise<DigestState> {
  const days = parsePeriod(formData.get("days"));
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/admin/feedback");

  const { data, error } = await supabase.rpc("admin_feedback", {
    period_days: days,
  });
  if (error) return { status: "error", error: "אין הרשאה לקרוא את המשוב." };
  const items = (data ?? []) as FeedbackItem[];
  if (!items.length) {
    return { status: "error", error: "אין משוב בתקופה הזו לסכם." };
  }

  try {
    const digest = await digestFeedback(items);
    const saved = await supabase.rpc("save_feedback_digest", {
      period_days: days,
      feedback_count: items.length,
      digest,
    });
    if (saved.error) throw new Error(saved.error.message);
  } catch (e) {
    const aiError = toAiError(e);
    console.error("Feedback digest failed:", aiError.message);
    return {
      status: "error",
      error: `הסיכום לא הצליח. אפשר לנסות שוב. (${aiError.code})`,
    };
  }
  revalidatePath("/admin/feedback");
  return { status: "idle" };
}
