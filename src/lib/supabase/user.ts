import type { SupabaseClient } from "@supabase/supabase-js";
import { parseAddress, type Address } from "@/lib/address";

export interface SignedInUser {
  id: string;
  email?: string;
  /** How to address the user in Hebrew, or null before they choose. */
  address: Address | null;
}

/**
 * Returns the signed-in user from the session cookie.
 *
 * getClaims() verifies the session token's signature locally with the
 * project's public signing key, instead of asking the Supabase Auth server
 * on every page load as getUser() does. Same security guarantee, one less
 * network round trip per request.
 */
export async function getSignedInUser(
  supabase: SupabaseClient,
): Promise<SignedInUser | null> {
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const { sub, email, user_metadata } = data.claims;
  return {
    id: sub,
    email: typeof email === "string" ? email : undefined,
    address: parseAddress(
      (user_metadata as Record<string, unknown> | undefined)?.address,
    ),
  };
}
