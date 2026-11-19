export type Device = "phone" | "tablet" | "desktop";

/** Sorts a browser's user agent into phone, tablet or desktop. */
export function deviceFromUserAgent(userAgent: string | null): Device | null {
  if (!userAgent) return null;
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) return "phone";
  return "desktop";
}
