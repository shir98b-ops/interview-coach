/**
 * Helpers for dictated answers. The browser turns speech into text; these
 * pure functions decide which language to listen for and how new words join
 * what the user already wrote.
 */

export const speechLanguages = {
  he: { code: "he-IL", label: "עברית" },
  en: { code: "en-US", label: "English" },
} as const;

export type SpeechLanguage = keyof typeof speechLanguages;

/** Listen in Hebrew when the question is in Hebrew, otherwise in English. */
export function languageFor(text: string): SpeechLanguage {
  return /[֐-׿]/.test(text) ? "he" : "en";
}

/**
 * Adds a dictated phrase to the end of the answer, with one space between
 * them, and never past the answer's length limit.
 */
export function appendTranscript(
  existing: string,
  addition: string,
  maxLength: number,
): string {
  const phrase = addition.trim().replace(/\s+/g, " ");
  if (!phrase) return existing;
  const separator = existing === "" || /\s$/.test(existing) ? "" : " ";
  return `${existing}${separator}${phrase}`.slice(0, maxLength);
}

/** What to tell the user when listening fails, or null to stay quiet. */
export function speechErrorMessage(error: string): string | null {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "אין גישה למיקרופון. אם פתחת את הקישור מתוך אפליקציה אחרת, כדאי לפתוח אותו ישירות בספארי או בכרום. אחרת צריך לאשר את המיקרופון בהגדרות הדפדפן ולנסות שוב.";
    case "audio-capture":
      return "לא נמצא מיקרופון. אפשר לחבר מיקרופון או להקליד.";
    case "network":
      return "זיהוי הדיבור צריך חיבור לאינטרנט. אפשר לנסות שוב או להקליד.";
    case "language-not-supported":
      return "הדפדפן הזה לא מזהה דיבור בשפה הזאת. אפשר להחליף שפה או להקליד.";
    // Silence and a deliberate stop are normal, not errors.
    case "no-speech":
    case "aborted":
      return null;
    default:
      return "זיהוי הדיבור נעצר. אפשר ללחוץ שוב על המיקרופון או להקליד.";
  }
}
