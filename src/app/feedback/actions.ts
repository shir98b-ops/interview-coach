"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { feedbackPage, validateFeedback } from "@/lib/feedback/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { track } from "@/lib/analytics/record";

export type FeedbackState = {
  status: "idle" | "sent" | "error";
  error?: string;
};

/** Saves a message from the feedback button, with the page it came from. */
export async function sendFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const checked = validateFeedback(formData.get("message"));
  if (!checked.ok) return { status: "error", error: checked.error };

  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login");

  const page = feedbackPage((await headers()).get("referer"));
  const { error } = await supabase
    .from("feedback")
    .insert({ user_id: user.id, message: checked.text, page });
  if (error) {
    console.error("Saving feedback failed:", error.message);
    return { status: "error", error: "לא הצלחנו לשלוח. אפשר לנסות שוב." };
  }
  track("feedback_sent", { page }, { supabase, user });
  return { status: "sent" };
}
