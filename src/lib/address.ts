/**
 * How the app addresses the user in Hebrew, where verbs and adjectives
 * change with gender. Users choose it in their profile; until they do,
 * the app shows both forms.
 */
export type Address = "m" | "f";

export const addressLabels: Record<Address, string> = {
  m: "בלשון זכר",
  f: "בלשון נקבה",
};

export function parseAddress(value: unknown): Address | null {
  return value === "m" || value === "f" ? value : null;
}

/**
 * Resolves gendered text written as {masculine|feminine}, for example
 * "{בחר|בחרי} תפקיד". Without a choice it shows both: "בחר/בחרי תפקיד".
 */
export function g(text: string, address: Address | null): string {
  return text.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m: string, f: string) =>
    address === "m" ? m : address === "f" ? f : `${m}/${f}`,
  );
}

/** The instruction that tells the AI how to address the user in Hebrew. */
export function addressInstruction(address: Address | null): string {
  if (address === "m") {
    return "When writing in Hebrew, address the candidate in the masculine second person (אתה).";
  }
  if (address === "f") {
    return "When writing in Hebrew, address the candidate in the feminine second person (את).";
  }
  return "When writing in Hebrew, the candidate's gender is unknown: use gender-neutral phrasing (infinitives, or plural forms), and never assume a gender.";
}
