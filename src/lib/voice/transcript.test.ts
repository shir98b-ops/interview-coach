import { describe, expect, it } from "vitest";
import {
  appendTranscript,
  languageFor,
  speechErrorMessage,
} from "./transcript";

describe("languageFor", () => {
  it("listens in Hebrew for a Hebrew question", () => {
    expect(languageFor("ספר על פרויקט שהובלת")).toBe("he");
  });
  it("listens in English otherwise", () => {
    expect(languageFor("Tell me about a project you led")).toBe("en");
    expect(languageFor("")).toBe("en");
  });
  it("treats a mixed question with Hebrew as Hebrew", () => {
    expect(languageFor("איך היית משפר את Jira?")).toBe("he");
  });
});

describe("appendTranscript", () => {
  it("starts an empty answer with the phrase", () => {
    expect(appendTranscript("", " שלום עולם ", 100)).toBe("שלום עולם");
  });
  it("adds one space before the new phrase", () => {
    expect(appendTranscript("first part", "second part", 100)).toBe(
      "first part second part",
    );
    expect(appendTranscript("first part\n", "next", 100)).toBe(
      "first part\nnext",
    );
  });
  it("collapses extra whitespace inside the phrase", () => {
    expect(appendTranscript("a", "b   c\n d", 100)).toBe("a b c d");
  });
  it("ignores an empty phrase", () => {
    expect(appendTranscript("keep", "   ", 100)).toBe("keep");
  });
  it("never goes past the length limit", () => {
    expect(appendTranscript("abc", "defgh", 6)).toBe("abc de");
  });
});

describe("speechErrorMessage", () => {
  it("explains a blocked microphone", () => {
    expect(speechErrorMessage("not-allowed")).toContain("מיקרופון");
  });
  it("stays quiet on silence or a deliberate stop", () => {
    expect(speechErrorMessage("no-speech")).toBeNull();
    expect(speechErrorMessage("aborted")).toBeNull();
  });
  it("has a fallback for unknown errors", () => {
    expect(speechErrorMessage("something-new")).toBeTruthy();
  });
});
