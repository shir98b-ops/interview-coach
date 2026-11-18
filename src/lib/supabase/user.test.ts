import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { getSignedInUser } from "./user";

const clientWith = (result: unknown) =>
  ({ auth: { getClaims: async () => result } }) as unknown as SupabaseClient;

describe("getSignedInUser", () => {
  it("returns the user from verified claims", async () => {
    const supabase = clientWith({
      data: { claims: { sub: "u1", email: "a@b.co" } },
      error: null,
    });
    expect(await getSignedInUser(supabase)).toEqual({
      id: "u1",
      email: "a@b.co",
    });
  });

  it("returns null when there is no valid session", async () => {
    expect(
      await getSignedInUser(clientWith({ data: null, error: new Error("x") })),
    ).toBeNull();
  });
});
