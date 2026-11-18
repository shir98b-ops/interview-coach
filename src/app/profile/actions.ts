"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { parseAddress } from "@/lib/address";
import { safeNextPath } from "@/lib/auth/redirect";
import { ExtractionError, extractResume } from "@/lib/resume/extract";
import {
  resumeSchema,
  validateResumeFile,
  type ResumeData,
} from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

export type ExtractState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "review"; data: ResumeData };

const extractionMessages: Record<ExtractionError["reason"], string> = {
  config: "קריאת קורות חיים עדיין לא מוגדרת. אפשר לנסות שוב מאוחר יותר.",
  auth: "קריאת קורות חיים לא זמינה כרגע: שירות הבינה המלאכותית לא קיבל את מפתח הגישה.",
  billing:
    "קריאת קורות חיים לא זמינה כרגע: נגמר הקרדיט בחשבון שירות הבינה המלאכותית.",
  unreadable:
    "לא הצלחנו לקרוא את הקובץ. אפשר לנסות קובץ PDF אחר, עדיף כזה שיוצא ישירות מהמסמך ולא סרוק.",
  service: "משהו השתבש בקריאת הקובץ. אפשר לנסות שוב.",
};

async function requireUser() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login?next=/profile");
  return { supabase, user };
}

/** Reads the uploaded PDF and returns the extracted details for review. */
export async function extractResumeAction(
  _prev: ExtractState,
  formData: FormData,
): Promise<ExtractState> {
  await requireUser();
  const file = formData.get("resume");
  const checked = validateResumeFile(file instanceof File ? file : null);
  if (!checked.ok) return { status: "error", error: checked.error };

  try {
    const data = await extractResume(await checked.file.arrayBuffer());
    return { status: "review", data };
  } catch (error) {
    if (error instanceof ExtractionError) {
      console.error("Resume extraction failed:", error.reason, error.message);
      return {
        status: "error",
        error: `${extractionMessages[error.reason]} (קוד שגיאה: ${error.code})`,
      };
    }
    throw error;
  }
}

/** Saves the details the user reviewed. The file itself is never stored. */
export async function saveProfile(
  input: ResumeData,
): Promise<{ error: string } | void> {
  const parsed = resumeSchema.safeParse(input);
  if (!parsed.success) return { error: "חלק מהשדות לא תקינים." };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    full_name: parsed.data.fullName || null,
    resume_data: parsed.data,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("Saving profile failed:", error.message);
    return { error: "לא הצלחנו לשמור את הפרופיל. אפשר לנסות שוב." };
  }
  redirect("/profile?saved=1");
}

/** Adds a role the user is preparing for. */
export async function addTargetRole(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const seniority = String(formData.get("seniority") ?? "").trim();
  if (!title || title.length > 120) return;

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("target_roles").insert({
    user_id: user.id,
    title,
    seniority: seniority || null,
  });
  if (error) console.error("Adding target role failed:", error.message);
  refresh();
}

export async function removeTargetRole(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase } = await requireUser();
  // Row level security limits the delete to the user's own roles.
  const { error } = await supabase.from("target_roles").delete().eq("id", id);
  if (error) console.error("Removing target role failed:", error.message);
  refresh();
}

/** Saves how the app should address the user in Hebrew. */
export async function setAddress(formData: FormData) {
  const address = parseAddress(formData.get("address"));
  const next = safeNextPath(String(formData.get("next") ?? "/profile"));
  const { supabase } = await requireUser();
  if (!address) redirect(next);

  // Kept in the account's own settings, so it works before a resume exists.
  const { error } = await supabase.auth.updateUser({ data: { address } });
  if (error) {
    console.error("Saving address failed:", error.message);
  } else {
    // A new session token carries the choice to every page right away.
    await supabase.auth.refreshSession();
  }
  redirect(next);
}
