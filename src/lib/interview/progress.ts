/** A scored practice, with what makes two practices comparable. */
export interface ScoredPractice {
  overall_score: number | null;
  target_role_id: string | null;
  job_id: string | null;
  stage: string | null;
  questions: { kind: string }[] | null;
}

/** The kind of round, read from its questions: general, professional, case or coding. */
export function roundKind(questions: { kind: string }[] | null): string {
  const kinds = (questions ?? []).map((q) => q.kind.split(":")[0]);
  for (const kind of ["coding", "design", "technical"]) {
    if (kinds.includes(kind)) return kind;
  }
  return "general";
}

const sameKind = (a: ScoredPractice, b: ScoredPractice) =>
  a.target_role_id === b.target_role_id &&
  a.job_id === b.job_id &&
  a.stage === b.stage &&
  roundKind(a.questions) === roundKind(b.questions);

/**
 * How the latest score moved from the previous practice of the same kind:
 * the same role or job, and the same kind of interview. Scores of a case
 * round and a general round, or of two different roles, say nothing about
 * progress, so they are not compared. Practices are newest first.
 */
export function scoreChange(practices: ScoredPractice[]): number | null {
  const scored = practices.filter((p) => p.overall_score !== null);
  const [latest, ...earlier] = scored;
  if (!latest) return null;
  const previous = earlier.find((p) => sameKind(p, latest));
  return previous
    ? (latest.overall_score as number) - (previous.overall_score as number)
    : null;
}
