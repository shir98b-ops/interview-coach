import { describe, expect, it } from "vitest";
import { getLesson, lessons, recommendLesson } from "./lessons";

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

  it("returns nothing when every lesson is done", () => {
    expect(
      recommendLesson(
        [],
        lessons.map((l) => l.slug),
      ),
    ).toBeUndefined();
  });
});
