import "server-only";
import { headers } from "next/headers";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasNoLimits } from "@/lib/auth/no-limits";
import { createClient } from "@/lib/supabase/server";
import { getSignedInUser } from "@/lib/supabase/user";
import { deviceFromUserAgent } from "./device";
import { cleanProps, type EventName, type EventProps } from "./events";
import { costUsd, type TokenUsage } from "./pricing";

/**
 * Records usage for the owner's analytics. Measuring must never break or
 * slow down the product: rows are written after the response is sent, and
 * every failure is logged and swallowed.
 */

function later(task: () => Promise<void>) {
  try {
    after(task);
  } catch {
    // Outside a request, such as in a script: write right away.
    void task();
  }
}

interface Context {
  supabase: SupabaseClient;
  user: { id: string; email?: string };
}

async function currentContext(given?: Context): Promise<Context | null> {
  if (given) return given;
  const supabase = await createClient();
  const user = await getSignedInUser(supabase);
  return user ? { supabase, user } : null;
}

/** Saves one AI call's tokens and cost. Called by the AI client itself. */
export function recordAiUsage(
  action: string,
  model: string,
  usage: TokenUsage,
): void {
  later(() => saveAiUsage(action, model, usage));
}

async function saveAiUsage(
  action: string,
  model: string,
  usage: TokenUsage,
): Promise<void> {
  try {
    const context = await currentContext();
    if (!context) return;
    const { error } = await context.supabase.from("ai_usage").insert({
      user_id: context.user.id,
      action,
      model,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cache_read_tokens: usage.cache_read_input_tokens ?? 0,
      cache_write_tokens: usage.cache_creation_input_tokens ?? 0,
      cost_usd: costUsd(model, usage),
      is_internal: hasNoLimits(context.user.email),
    });
    if (error) console.error("Recording AI usage failed:", error.message);
  } catch (error) {
    console.error("Recording AI usage failed:", error);
  }
}

/** Saves one product event, such as a started practice. */
export function track(
  name: EventName,
  props?: EventProps,
  given?: Context,
): void {
  later(() => saveEvent(name, props, given));
}

async function saveEvent(
  name: EventName,
  props?: EventProps,
  given?: Context,
): Promise<void> {
  try {
    const context = await currentContext(given);
    if (!context) return;
    const device = deviceFromUserAgent((await headers()).get("user-agent"));
    const { error } = await context.supabase.from("product_events").insert({
      user_id: context.user.id,
      name,
      props: cleanProps(props),
      device,
      is_internal: hasNoLimits(context.user.email),
    });
    if (error) console.error("Recording event failed:", error.message);
  } catch (error) {
    console.error("Recording event failed:", error);
  }
}
