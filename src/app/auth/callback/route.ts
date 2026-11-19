import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/redirect";
import { track } from "@/lib/analytics/record";
import { createClient } from "@/lib/supabase/server";

/** The sign-in link from the email lands here and starts the session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // A first sign-in creates the account moments before this point.
      const user = data.user;
      if (user && Date.now() - Date.parse(user.created_at) < 10 * 60_000) {
        track("signup", {}, { supabase, user });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
