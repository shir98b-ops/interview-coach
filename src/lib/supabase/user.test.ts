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
      address: null,
      tourDone: false,
    });
  });

  it("reads the chosen form of address", async () => {
    const supabase = clientWith({
      data: { claims: { sub: "u1", user_metadata: { address: "f" } } },
      error: null,
    });
    expect((await getSignedInUser(supabase))?.address).toBe("f");
  });

  it("remembers that the welcome tour was turned off", async () => {
    const supabase = clientWith({
      data: { claims: { sub: "u1", user_metadata: { tour_done: true } } },
      error: null,
    });
    expect((await getSignedInUser(supabase))?.tourDone).toBe(true);
  });

  it("returns null when there is no valid session", async () => {
    expect(
      await getSignedInUser(clientWith({ data: null, error: new Error("x") })),
    ).toBeNull();
  });
});
