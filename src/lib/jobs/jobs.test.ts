import { describe, expect, it } from "vitest";
import { calendarStamp, googleCalendarLink, icsFile } from "./calendar";
import {
  historyText,
  parseDuration,
  parseKind,
  parseStatus,
  safeLink,
  validateJob,
} from "./schema";
import { daysUntil, fromLocalInput, toLocalInput, whenLabel } from "./time";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
};

describe("validateJob", () => {
  it("accepts a job and adds https to a bare link", () => {
    const result = validateJob(
      form({
        company: " Wix ",
        title: "PM",
        link: "wix.com/jobs/1",
        status: "saved",
      }),
    );
    expect(result).toEqual({
      ok: true,
      value: {
        company: "Wix",
        title: "PM",
        link: "https://wix.com/jobs/1",
        status: "saved",
      },
    });
  });

  it("requires a company and a title", () => {
    expect(validateJob(form({ title: "PM" })).ok).toBe(false);
    expect(validateJob(form({ company: "Wix" })).ok).toBe(false);
  });

  it("rejects links that are not web pages", () => {
    expect(safeLink("javascript:alert(1)")).toBeNull();
    expect(safeLink("ftp://x.com")).toBeNull();
    expect(safeLink("localhost")).toBeNull();
    expect(
      validateJob(form({ company: "A", title: "B", link: "nope" })).ok,
    ).toBe(false);
  });

  it("falls back to safe defaults for unknown choices", () => {
    expect(parseStatus("hacked")).toBe("applied");
    expect(parseKind(null)).toBe("other");
    expect(parseDuration("7")).toBe(60);
    expect(parseDuration("90")).toBe(90);
  });
});

describe("Israel time", () => {
  it("reads winter input as UTC+2", () => {
    expect(fromLocalInput("2026-12-01T10:30")?.toISOString()).toBe(
      "2026-12-01T08:30:00.000Z",
    );
  });

  it("reads summer input as UTC+3", () => {
    expect(fromLocalInput("2026-07-01T10:30")?.toISOString()).toBe(
      "2026-07-01T07:30:00.000Z",
    );
  });

  it("round-trips to the input format", () => {
    const date = fromLocalInput("2026-07-01T10:30")!;
    expect(toLocalInput(date)).toBe("2026-07-01T10:30");
  });

  it("rejects anything that is not a date and time", () => {
    expect(fromLocalInput("tomorrow")).toBeNull();
    expect(fromLocalInput(undefined)).toBeNull();
  });

  it("counts calendar days in Israel, not hours", () => {
    const now = new Date("2026-12-01T21:00:00Z"); // 23:00 in Israel
    expect(daysUntil(new Date("2026-12-01T22:30:00Z"), now)).toBe(1);
    expect(daysUntil(new Date("2026-12-01T21:30:00Z"), now)).toBe(0);
    expect(whenLabel(1)).toBe("מחר");
    expect(whenLabel(5)).toBe("בעוד 5 ימים");
  });
});

describe("calendar", () => {
  const event = {
    id: "abc",
    title: "ראיון ב-Wix, PM",
    start: new Date("2026-12-01T08:30:00Z"),
    minutes: 45,
    details: "שורה 1\nשורה 2",
    location: "Zoom; link",
  };

  it("stamps times in UTC", () => {
    expect(calendarStamp(event.start)).toBe("20261201T083000Z");
  });

  it("builds a Google Calendar link with start and end", () => {
    const url = new URL(googleCalendarLink(event));
    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("dates")).toBe(
      "20261201T083000Z/20261201T091500Z",
    );
    expect(url.searchParams.get("location")).toBe("Zoom; link");
  });

  it("writes a valid .ics file with escaped text", () => {
    const ics = icsFile(event, new Date("2026-11-19T00:00:00Z"));
    expect(ics).toContain("DTSTART:20261201T083000Z");
    expect(ics).toContain("DTEND:20261201T091500Z");
    expect(ics).toContain("DESCRIPTION:שורה 1\\nשורה 2");
    expect(ics).toContain("LOCATION:Zoom\; link");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});

describe("historyText", () => {
  it("says when this is the first stage", () => {
    expect(historyText([])).toContain("first stage");
  });

  it("lists earlier stages with the candidate's notes", () => {
    const text = historyText([
      { kind: "hr", date: "2026-11-20", reflection: "Asked about salary" },
      { kind: "professional", date: "2026-11-25", reflection: null },
    ]);
    expect(text).toContain("hr: Asked about salary");
    expect(text).toContain("professional: (no notes)");
  });
});
