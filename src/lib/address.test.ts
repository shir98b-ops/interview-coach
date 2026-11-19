import { describe, expect, it } from "vitest";
import {
  addressInstruction,
  g,
  hebrewScriptRule,
  parseAddress,
} from "./address";

describe("g", () => {
  it("picks the form for the user's choice", () => {
    expect(g("{בחר|בחרי} תפקיד", "m")).toBe("בחר תפקיד");
    expect(g("{בחר|בחרי} תפקיד", "f")).toBe("בחרי תפקיד");
  });

  it("shows both forms when there is no choice", () => {
    expect(g("{אתה|את} {מוכן|מוכנה}", null)).toBe("אתה/את מוכן/מוכנה");
  });

  it("leaves plain text alone", () => {
    expect(g("אפשר לנסות שוב", "f")).toBe("אפשר לנסות שוב");
  });
});

describe("parseAddress", () => {
  it("accepts only known values", () => {
    expect(parseAddress("f")).toBe("f");
    expect(parseAddress("x")).toBeNull();
    expect(parseAddress(undefined)).toBeNull();
  });
});

describe("addressInstruction", () => {
  it("never assumes a gender without a choice", () => {
    expect(addressInstruction(null)).toMatch(/gender-neutral/);
    expect(addressInstruction("f")).toMatch(/feminine/);
  });
});

describe("hebrewScriptRule", () => {
  it("is part of every address instruction", () => {
    for (const address of ["m", "f", null] as const) {
      expect(addressInstruction(address)).toContain(hebrewScriptRule);
    }
  });
});
