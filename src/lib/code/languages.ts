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
  verilog: "Verilog / SystemVerilog",
  vhdl: "VHDL",
} as const;

/** Hardware description languages, whose problems are RTL blocks. */
export function isHdl(language: CodeLanguage): boolean {
  return language === "verilog" || language === "vhdl";
}

export type CodeLanguage = keyof typeof codeLanguages;

export function parseCodeLanguage(value: unknown): CodeLanguage {
  return typeof value === "string" && Object.hasOwn(codeLanguages, value)
    ? (value as CodeLanguage)
    : "python";
}

/** The language a candidate for this role most likely codes in. */
export function defaultCodeLanguage(title: string): CodeLanguage {
  const t = title.toLowerCase();
  if (/\bvhdl\b/.test(t)) return "vhdl";
  if (
    /\b(fpga|verilog|rtl|asic|vlsi|uvm|chip|silicon)\b|verification engineer|design verification|logic design|שבב|אימות|וריפיקציה|תכנון לוגי/.test(
      t,
    )
  )
    return "verilog";
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
 * The language for a specific job: the title's guess, except that an FPGA or
 * chip posting that asks mostly for VHDL gets VHDL.
 */
export function defaultCodeLanguageForJob(
  title: string,
  description: string | null,
): CodeLanguage {
  const language = defaultCodeLanguage(title);
  if (!isHdl(language) || !description) return language;
  const count = (pattern: RegExp) => description.match(pattern)?.length ?? 0;
  return count(/\bvhdl\b/gi) > count(/\b(system)?verilog\b/gi)
    ? "vhdl"
    : language;
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
