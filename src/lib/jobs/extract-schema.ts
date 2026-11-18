import { z } from "zod";
import { safeLink } from "./schema";

export const MIN_PASTE_LENGTH = 80;
export const MAX_PASTE_LENGTH = 30000;
/** Adding by paste costs a fraction of a cent; this only stops abuse. */
export const DAILY_JOB_LIMIT = 30;

export type PasteCheck =
  | { ok: true; kind: "text"; text: string }
  | { ok: true; kind: "link"; link: string }
  | { ok: false; error: string };

/** Checks the pasted job page before it goes to the AI. */
export function validatePaste(value: unknown): PasteCheck {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return { ok: false, error: "צריך להדביק את עמוד המשרה." };
  if (/^\S+$/.test(text) && safeLink(text)) {
    return { ok: true, kind: "link", link: text };
  }
  if (text.length < MIN_PASTE_LENGTH) {
    return {
      ok: false,
      error: "הטקסט קצר מדי. כדאי להעתיק את כל עמוד המשרה.",
    };
  }
  return { ok: true, kind: "text", text: text.slice(0, MAX_PASTE_LENGTH) };
}

/** What the AI reads out of a pasted job page. */
export const extractedJobSchema = z.object({
  isJobPosting: z.boolean(),
  company: z.string(),
  title: z.string(),
  link: z.string(),
  description: z.string(),
});

export type ExtractedJob = z.infer<typeof extractedJobSchema>;

export interface JobFromPaste {
  company: string;
  title: string;
  link: string | null;
  description: string;
}

/** Cleans the AI's answer, or returns null when it is not a usable job. */
export function readExtractedJob(value: unknown): JobFromPaste | null {
  const parsed = extractedJobSchema.safeParse(value);
  if (!parsed.success || !parsed.data.isJobPosting) return null;
  const company = parsed.data.company.trim().slice(0, 120);
  const title = parsed.data.title.trim().slice(0, 120);
  const description = parsed.data.description.trim().slice(0, 15000);
  if (!company || !title || description.length < 40) return null;
  return {
    company,
    title,
    link: parsed.data.link.trim() ? safeLink(parsed.data.link.trim()) : null,
    description,
  };
}

/** Finds the first web link in the pasted text, if there is one. */
export function firstLink(text: string): string | null {
  const match = /https?:\/\/[^\s<>"')]+/i.exec(text);
  return match ? safeLink(match[0]) : null;
}
