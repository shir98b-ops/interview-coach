"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { AiError } from "@/lib/ai/client";
import { limitWindowStart, usageStatus } from "@/lib/interview/limits";
import { reviewResume } from "@/lib/resume/review";
import { DAILY_REVIEW_LIMIT, reviewScore } from "@/lib/resume/review-schema";
import { resumeSchema } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";
import { hasNoLimits } from "@/lib/auth/no-limits";
import { getSignedInUser } from "@/lib/supabase/user";
import { track } from "@/lib/analytics/record";

export type ReviewState = { error: string | null };

const aiMessages: Record<AiError["reason"], string> = {
  config: "הדירוג עדיין לא מוגדר. אפשר לנסות שוב מאוחר יותר.",
  auth: "הדירוג לא זמין כרגע: שירות הבינה המלאכותית לא קיבל את מפתח הגישה.",
  billing: "הדירוג לא זמין כרגע: נגמר הקרדיט בחשבון שירות הבינה המלאכותית.",
  unreadable: "לא הצלחנו לדרג את קורות החיים. אפשר לנסות שוב.",
  service: "משהו השתבש בדירוג. אפשר לנסות שוב.",
};

/** Rates the saved resume, for the chosen target role or in general. */
export async function rateResume(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/profile/review");

  const roleId = String(formData.get("roleId") ?? "");
  const [{ data: profile }, { data: role }, { data: recent }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("resume_data")
        .eq("user_id", user.id)
        .maybeSingle(),
      roleId
        ? supabase
            .from("target_roles")
            .select("id, title, seniority")
            .eq("id", roleId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("resume_reviews")
        .select("created_at")
        .gt("created_at", limitWindowStart().toISOString()),
    ]);

  const resume = resumeSchema.safeParse(profile?.resume_data);
  if (!resume.success) {
    return { error: "קודם צריך להעלות קורות חיים בעמוד הפרופיל." };
  }
  const usage = usageStatus(
    (recent ?? []).map((row) => new Date(row.created_at)),
    new Date(),
    DAILY_REVIEW_LIMIT,
  );
  if (usage.remaining === 0 && !hasNoLimits(user.email)) {
    track("limit_reached", { feature: "resume_review" }, { supabase, user });
    const hours = usage.hoursUntilNext ?? 1;
    return {
      error: `הגעת למגבלה של ${usage.limit} דירוגים ביום. אפשר לדרג שוב בעוד כ־${hours === 1 ? "שעה" : `${hours} שעות`}.`,
    };
  }

  const roleTitle = role
    ? `${role.title}${role.seniority ? ` (${role.seniority})` : ""}`
    : null;
  let review;
  try {
    review = await reviewResume(resume.data, roleTitle, user.address);
  } catch (error) {
    if (error instanceof AiError) {
      console.error("Resume review failed:", error.reason, error.message);
      return {
        error: `${aiMessages[error.reason]} (קוד שגיאה: ${error.code})`,
      };
    }
    throw error;
  }

  const { error } = await supabase.from("resume_reviews").insert({
    user_id: user.id,
    target_role_id: role?.id ?? null,
    role_title: roleTitle,
    score: reviewScore(review),
    feedback: review,
  });
  if (error) {
    console.error("Saving resume review failed:", error.message);
    return { error: "לא הצלחנו לשמור את הדירוג. אפשר לנסות שוב." };
  }
  track("resume_reviewed", { forRole: Boolean(role) }, { supabase, user });
  refresh();
  return { error: null };
}
