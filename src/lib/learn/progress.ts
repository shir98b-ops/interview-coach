import "server-only";
import { readFeedback } from "@/lib/interview/feedback";
import { isCodingKind } from "@/lib/interview/schema";
import type { createClient } from "@/lib/supabase/server";
import { recommendLesson } from "./lessons";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * What the user has learned so far and which lesson to suggest next, from
 * their finished lessons and the scores of their latest answers.
 */
export async function getLearningState(supabase: Supabase) {
  // Row level security limits both reads to the user's own rows.
  const [{ data: attempts }, { data: answers }] = await Promise.all([
    supabase.from("lesson_attempts").select("lesson_slug"),
    supabase
      .from("answers")
      .select("scores, questions(kind)")
      .not("scores", "is", null)
      .order("created_at", { ascending: false })
      .limit(15),
  ]);
  const completed = new Set(
    (attempts ?? []).map((a) => a.lesson_slug as string),
  );
  // Lessons teach how to answer out loud, so code answers do not count.
  const kindOf = (a: { questions: unknown }) => {
    const q = a.questions as { kind: string } | { kind: string }[] | null;
    return (Array.isArray(q) ? q[0]?.kind : q?.kind) ?? "";
  };
  const scores = (answers ?? [])
    .filter((a) => !isCodingKind(kindOf(a)))
    .map((a) => readFeedback(a.scores))
    .filter((f) => f !== null);
  return {
    completed,
    recommended: recommendLesson(scores, completed),
  };
}
