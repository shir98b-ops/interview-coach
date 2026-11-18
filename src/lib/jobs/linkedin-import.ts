import { unzipSync, strFromU8 } from "fflate";
import { safeLink } from "./schema";

/** The most jobs one import adds, so a huge file cannot flood the account. */
export const MAX_IMPORT_ROWS = 300;
export const MAX_IMPORT_BYTES = 30 * 1024 * 1024;

/** Splits CSV text into rows, handling quoted fields with commas and newlines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim()));
}

export interface ImportedJob {
  company: string;
  title: string;
  link: string | null;
  appliedAt: string | null;
}

const normalize = (h: string) => h.toLowerCase().replace(/[^a-z]/g, "");

function column(headers: string[], ...names: string[]): number {
  const keys = headers.map(normalize);
  for (const name of names) {
    const index = keys.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

export type ImportResult =
  { ok: true; jobs: ImportedJob[] } | { ok: false; error: string };

/**
 * Reads the job applications file from a LinkedIn data export ("Job
 * Applications.csv"; "Saved Jobs.csv" works too). Columns are found by name,
 * so a changed column order still works.
 */
export function readLinkedInJobs(text: string): ImportResult {
  const [headers, ...rows] = parseCsv(text);
  if (!headers) return { ok: false, error: "הקובץ ריק." };
  const company = column(headers, "companyname", "company");
  const title = column(headers, "jobtitle", "title");
  const url = column(headers, "joburl", "url");
  const date = column(headers, "applicationdate", "saveddate", "date");
  if (company === -1 || title === -1) {
    return {
      ok: false,
      error:
        "זה לא נראה כמו קובץ המשרות של לינקדאין. מחפשים בתיקייה שהורדת את הקובץ של המשרות שהגשת אליהן.",
    };
  }

  const seen = new Set<string>();
  const jobs: ImportedJob[] = [];
  for (const row of rows) {
    const job: ImportedJob = {
      company: (row[company] ?? "").trim().slice(0, 120),
      title: (row[title] ?? "").trim().slice(0, 120),
      link: url === -1 ? null : safeLink((row[url] ?? "").trim()),
      appliedAt: date === -1 ? null : (row[date] ?? "").trim() || null,
    };
    if (!job.company || !job.title) continue;
    const key = job.link ?? `${job.company}|${job.title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    jobs.push(job);
    if (jobs.length >= MAX_IMPORT_ROWS) break;
  }
  if (jobs.length === 0) {
    return { ok: false, error: "לא מצאנו משרות בקובץ." };
  }
  return { ok: true, jobs };
}

/**
 * Gets the applications file out of what the user uploaded: the CSV itself,
 * or the whole zip archive LinkedIn sends.
 */
export function importFileText(name: string, bytes: Uint8Array): string | null {
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
  if (!isZip)
    return name.toLowerCase().endsWith(".csv") ? strFromU8(bytes) : null;
  try {
    const files = unzipSync(bytes, {
      filter: (file) =>
        /(job applications|saved jobs)[^/]*\.csv$/i.test(file.name),
    });
    const names = Object.keys(files);
    const pick =
      names.find((n) => /job applications/i.test(n)) ??
      names.find((n) => /saved jobs/i.test(n));
    return pick ? strFromU8(files[pick]) : null;
  } catch {
    return null;
  }
}
