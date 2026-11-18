import { describe, expect, it } from "vitest";
import { forAddress, getLesson, lessons, recommendLesson } from "./lessons";

const scores = (content: number, structure: number, clarity: number) => ({
  content,
  structure,
  clarity,
});

describe("lessons", () => {
  it("have unique slugs and an exercise each", () => {
    const slugs = lessons.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const lesson of lessons) {
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(lesson.exercise.question).not.toBe("");
      expect(lesson.exercise.goal).not.toBe("");
    }
  });

  it("finds a lesson by slug", () => {
    expect(getLesson("star")?.slug).toBe("star");
    expect(getLesson("nope")).toBeUndefined();
  });
});

describe("recommendLesson", () => {
  it("starts with the first lesson when there are no scores", () => {
    expect(recommendLesson([], [])?.slug).toBe(lessons[0].slug);
  });

  it("picks a lesson for the weakest criterion", () => {
    const lesson = recommendLesson([scores(4, 4, 2), scores(5, 4, 1)], []);
    expect(lesson?.focus).toBe("clarity");
  });

  it("skips finished lessons", () => {
    const structure = lessons.filter((l) => l.focus === "structure");
    const lesson = recommendLesson([scores(5, 1, 5)], [structure[0].slug]);
    expect(lesson?.slug).toBe(structure[1]?.slug);
  });

  it("falls back to another criterion when its lessons are all done", () => {
    const clarity = lessons.filter((l) => l.focus === "clarity");
    const lesson = recommendLesson(
      [scores(4, 3, 1)],
      clarity.map((l) => l.slug),
    );
    expect(lesson?.focus).toBe("structure");
  });

  it("recommends only interview lessons", () => {
    const interview = lessons.filter((l) => l.track === "interview");
    const lesson = recommendLesson(
      [],
      interview.slice(0, -1).map((l) => l.slug),
    );
    expect(lesson?.track).toBe("interview");
  });

  it("returns nothing when every lesson is done", () => {
    expect(
      recommendLesson(
        [],
        lessons.map((l) => l.slug),
      ),
    ).toBeUndefined();
  });
});

describe("forAddress", () => {
  it("resolves every marked word in every lesson", () => {
    for (const lesson of lessons) {
      for (const address of ["m", "f", null] as const) {
        const l = forAddress(lesson, address);
        const texts = [
          l.title,
          l.summary,
          l.exercise.question,
          l.exercise.hint,
          ...l.sections.flatMap((s) => [s.heading, s.body, s.example ?? ""]),
        ];
        for (const text of texts) expect(text).not.toMatch(/[{}]/);
      }
    }
  });

  it("speaks to the chosen gender", () => {
    const star = getLesson("star")!;
    expect(forAddress(star, "f").exercise.hint).toMatch(/^כתבי/);
    expect(forAddress(star, "m").exercise.hint).toMatch(/^כתוב/);
  });
});
