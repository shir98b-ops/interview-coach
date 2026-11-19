import Link from "next/link";
import { hasNoLimits } from "@/lib/auth/no-limits";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";

/**
 * A link to the owner's dashboard, shown only to owner accounts (the
 * UNLIMITED_EMAILS setting). Hiding it is for tidiness only: the dashboard
 * itself is protected by the database, which answers admins alone.
 */
export async function OwnerLink() {
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  if (!hasNoLimits(user?.email)) return null;
  return (
    <Link
      href="/admin/insights"
      className="bg-lime text-ink inline-flex min-h-11 items-center rounded-full px-4 font-bold hover:brightness-105"
    >
      ניהול
    </Link>
  );
}
