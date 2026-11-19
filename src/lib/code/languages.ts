/**
 * Programming languages offered in coding exercises and code take-homes.
 * The key is stored; the label is what people call the language.
 */
export const codeLanguages = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  go: "Go",
  kotlin: "Kotlin",
  swift: "Swift",
  sql: "SQL",
} as const;

export type CodeLanguage = keyof typeof codeLanguages;

export function parseCodeLanguage(value: unknown): CodeLanguage {
  return typeof value === "string" && Object.hasOwn(codeLanguages, value)
    ? (value as CodeLanguage)
    : "python";
}

/** The language a candidate for this role most likely codes in. */
export function defaultCodeLanguage(title: string): CodeLanguage {
  const t = title.toLowerCase();
  if (/\b(data analyst|bi|business intelligence|analytics)\b|אנליסט/.test(t))
    return "sql";
  if (/\bios\b|swift/.test(t)) return "swift";
  if (/\bandroid\b|kotlin/.test(t)) return "kotlin";
  if (/front[- ]?end|web|react|angular|vue|פרונט/.test(t)) return "typescript";
  if (/\bjava\b/.test(t)) return "java";
  if (/\.net|c#/.test(t)) return "csharp";
  if (/\bgo(lang)?\b/.test(t)) return "go";
  if (/c\+\+|embedded/.test(t)) return "cpp";
  if (/node|full[- ]?stack|פולסטאק/.test(t)) return "javascript";
  return "python";
}

/**
 * Builds the saved answer from the code and the optional explanation, with
 * the code in a fenced block so it is shown and read as code.
 */
export function codeAnswerText(
  language: CodeLanguage,
  code: string,
  explanation: string,
): string {
  const fence = "```";
  const parts = [`${fence}${language}\n${code.replace(/\s+$/, "")}\n${fence}`];
  if (explanation.trim()) parts.push(explanation.trim());
  return parts.join("\n\n");
}
