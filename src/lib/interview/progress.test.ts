import { describe, expect, it } from "vitest";
import { roundKind, scoreChange } from "./progress";

const practice = (
  score: number | null,
  role = "r1",
  kind = "behavioral",
  job: string | null = null,
) => ({
  overall_score: score,
  target_role_id: role,
  job_id: job,
  stage: null,
  questions: [{ kind }, { kind: "resume" }],
});

describe("scoreChange", () => {
  it("compares with the previous practice of the same kind", () => {
    expect(scoreChange([practice(60), practice(80, "r2"), practice(50)])).toBe(
      10,
    );
  });

  it("does not compare different kinds of interview", () => {
    expect(
      scoreChange([
        practice(24, "r1", "design"),
        practice(60, "r1", "behavioral"),
      ]),
    ).toBeNull();
  });

  it("reads the kind of round from its questions", () => {
    expect(roundKind([{ kind: "coding:python" }])).toBe("coding");
    expect(roundKind([{ kind: "technical" }, { kind: "role" }])).toBe(
      "technical",
    );
    expect(roundKind(null)).toBe("general");
  });

  it("skips practices that were not scored", () => {
    expect(scoreChange([practice(null), practice(70), practice(65)])).toBe(5);
    expect(scoreChange([])).toBeNull();
  });
});
