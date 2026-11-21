"use server";

import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

/**
 * Turns the welcome tour off for good. It is kept in the account's own
 * settings, so it stays off on every device the user signs in from.
 */
export async function hideTourForGood(): Promise<void> {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!user || user.tourDone) return;
  const { error } = await supabase.auth.updateUser({
    data: { tour_done: true },
  });
  if (error) {
    console.error("Saving the tour choice failed:", error.message);
    return;
  }
  // A new session token carries the choice to the next page load.
  await supabase.auth.refreshSession();
}
