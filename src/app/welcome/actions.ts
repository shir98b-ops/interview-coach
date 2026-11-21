"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

/** Where the welcome screen's two buttons may lead. */
const exits = new Set(["/profile", "/dashboard"]);

/**
 * Marks the welcome screen as seen and moves on. It is kept in the
 * account's own settings, so it does not show again on any device.
 */
export async function finishWelcome(formData: FormData): Promise<void> {
  const target = String(formData.get("next") ?? "");
  const next = exits.has(target) ? target : "/dashboard";
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user) redirect("/login");
  if (!user.tourDone) {
    const { error } = await supabase.auth.updateUser({
      data: { tour_done: true },
    });
    if (error) {
      console.error("Saving the welcome choice failed:", error.message);
    } else {
      // A new session token carries the choice to the next page load.
      await supabase.auth.refreshSession();
    }
  }
  redirect(next);
}
