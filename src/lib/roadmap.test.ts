import { describe, expect, it } from "vitest";
import { currentStage, roadmap } from "./roadmap";

describe("roadmap", () => {
  it("numbers stages consecutively from 1", () => {
    expect(roadmap.map((stage) => stage.number)).toEqual(
      roadmap.map((_, index) => index + 1),
    );
  });

  it("lists every MVP stage before any later stage", () => {
    const firstLater = roadmap.findIndex((stage) => !stage.mvp);
    const lastMvp = roadmap.findLastIndex((stage) => stage.mvp);
    expect(lastMvp).toBeLessThan(firstLater);
  });

  it("has at most one stage in progress", () => {
    const inProgress = roadmap.filter((s) => s.status === "in-progress");
    expect(inProgress.length).toBeLessThanOrEqual(1);
  });

  it("returns the stage in progress", () => {
    expect(currentStage()?.number).toBe(6);
  });
});
