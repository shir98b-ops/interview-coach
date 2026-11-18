import { safeLink } from "./schema";

const MAX_BYTES = 1_500_000;

export type LinkCheck =
  { ok: true; url: URL } | { ok: false; reason: "linkedin" | "invalid" };

/** Sites that forbid automated reading; the user pastes the page instead. */
const blockedHosts = ["linkedin.com", "lnkd.in"];

/**
 * Accepts only public https pages, so a pasted link cannot make the server
 * reach internal addresses.
 */
export function checkJobLink(value: string): LinkCheck {
  const link = safeLink(value);
  if (!link) return { ok: false, reason: "invalid" };
  const url = new URL(link);
  const host = url.hostname.toLowerCase();
  if (blockedHosts.some((h) => host === h || host.endsWith(`.${h}`))) {
    return { ok: false, reason: "linkedin" };
  }
  const isIp = /^[\d.]+$/.test(host) || host.includes(":");
  const isLocal =
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost");
  if (isIp || isLocal || url.port) return { ok: false, reason: "invalid" };
  url.protocol = "https:";
  return { ok: true, url };
}

/** Turns HTML into readable text, keeping line breaks between blocks. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Reads a public job page as text, or null when it cannot be read. */
export async function fetchJobPage(url: URL): Promise<string | null> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "InterviewCoach/1.0 (job page reader)",
        Accept: "text/html",
      },
    });
    if (!response.ok) return null;
    // A redirect must not lead to a blocked or internal address.
    if (!checkJobLink(response.url || url.toString()).ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("text/html")) return null;
    const html = (await response.text()).slice(0, MAX_BYTES);
    const text = htmlToText(html);
    return text.length >= 200 ? text : null;
  } catch {
    return null;
  }
}
