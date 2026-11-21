import { describe, expect, it } from "vitest";
import { jobNextAction } from "./next-action";

describe("jobNextAction", () => {
  it("points to the next booked interview first", () => {
    expect(
      jobNextAction("applied", { kindLabel: "ראיון מקצועי", days: 3 }),
    ).toBe("להתכונן לראיון מקצועי, בעוד 3 ימים");
  });

  it("follows the status otherwise", () => {
    expect(jobNextAction("saved", null)).toBe("להגיש מועמדות");
    expect(jobNextAction("offer", null)).toBe("לעבור על ההצעה ולהחליט");
    expect(jobNextAction("rejected", null)).toBe("");
  });
});
