import type { Seniority } from "@/lib/format";

/**
 * What each level means, in every prompt that writes or scores practice:
 * the questions, the take-home, and the feedback on both. Each level gets a
 * real interview for that level, not a softer or harder copy of another.
 */
export const levelDefinitions = `- Entry level (students, new graduates and up to about 2 years): what
  employers really ask juniors. Core fundamentals of the field explained in
  the candidate's own words, applied to a concrete, well-defined task, and
  the common situations of the first year on the job (learning fast, asking
  for help at the right time, owning a small piece of work). Behavioral
  questions may draw on studies, projects, internships, army or national
  service, volunteering and student jobs. Never ask about leading teams,
  strategy, budgets or years of experience they cannot have.
- Mid level (about 2 to 5 years): owning real work independently, depth
  beyond the basics, trade-offs, debugging and solving problems without help,
  working with other teams.
- Senior (5 years and more): complex and ambiguous situations, design
  decisions and their long-term cost, raising the bar of others, mentoring,
  strategic judgment.
- Manager: leading teams, priorities, budgets, hiring and people decisions.`;

/** Tells the AI which level this practice is for. */
export function levelLine(seniority: Seniority | null): string {
  return seniority
    ? `<level>${seniority}. The candidate chose this level: it wins over the level of the job posting and of the resume.</level>`
    : `<level>Not chosen. Use the level the job posting asks for; without a posting, the level the resume shows (years of experience and titles); else Mid level.</level>`;
}

/** How feedback is judged at each level, for interviews and take-homes. */
export const levelScoring = `Judge every answer against what a good
candidate at the level below shows in a real interview for it, using the
same scale at every level:
${levelDefinitions}
A junior answer that gets the fundamentals right, reasons clearly and is
honest about what they would check scores 4 or 5, without the depth,
leadership or scale expected of a senior. A senior answer is held to senior
depth and judgment, so a correct but junior-level answer scores 3 at most.
Professional mistakes count the same at every level.`;
