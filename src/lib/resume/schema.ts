import { z } from "zod";

/**
 * The details we keep from a resume. The original file is never stored:
 * it is read once, these fields are extracted, and the user reviews them
 * before anything is saved.
 */
export const resumeSchema = z.object({
  fullName: z.string().describe("The candidate's full name, or empty."),
  headline: z
    .string()
    .describe("A short professional headline, e.g. 'Operations analyst'."),
  summary: z
    .string()
    .describe("Two or three sentences summarizing the candidate's profile."),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        period: z.string().describe("e.g. '2021 - 2024', or empty."),
        highlights: z
          .array(z.string())
          .describe("Key achievements or responsibilities."),
      }),
    )
    .describe("Work experience, most recent first."),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string().describe("Graduation year or period, or empty."),
    }),
  ),
  skills: z.array(z.string()).describe("Skills, tools and languages."),
});

export type ResumeData = z.infer<typeof resumeSchema>;

export const MAX_RESUME_BYTES = 4 * 1024 * 1024;

/** Checks an uploaded file before it is sent for extraction. */
export function validateResumeFile(
  file: File | null,
): { ok: true; file: File } | { ok: false; error: string } {
  if (!file || file.size === 0) {
    return { ok: false, error: "צריך לבחור קובץ PDF להעלאה." };
  }
  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    return { ok: false, error: "כרגע אפשר להעלות רק קבצי PDF." };
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, error: "הקובץ גדול מ־4 מגה." };
  }
  return { ok: true, file };
}

/** Splits a comma or newline separated list typed by the user. */
export function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
