import type { InterviewKind } from "@/lib/jobs/schema";
import { readBrief, readTakeHomeFeedback } from "./schema";

/** A take-home the candidate submitted, with the review it got. */
export interface SubmittedTakeHome {
  title: string;
  brief: string;
  submission: string;
  weaknesses: string[];
  interviewQuestions: string[];
}

/**
 * Stages that review the candidate's work. A recruiter screen or an HR
 * interview does not dig into the take-home, so it is left out there.
 */
const STAGES_THAT_REVIEW_WORK: (InterviewKind | null)[] = [
  null,
  "professional",
  "manager",
  "final",
  "other",
];

export function stageReviewsTakeHome(stage: InterviewKind | null): boolean {
  return STAGES_THAT_REVIEW_WORK.includes(stage);
}

/**
 * Turns a saved, reviewed take-home into what the interview prompt needs.
 * Returns null when it was not submitted or reviewed yet.
 */
export function submittedTakeHome(row: {
  brief: unknown;
  submission: string | null;
  feedback: unknown;
}): SubmittedTakeHome | null {
  const brief = readBrief(row.brief);
  const feedback = readTakeHomeFeedback(row.feedback);
  const submission = row.submission?.trim();
  if (!brief || !feedback || !submission) return null;
  return {
    title: brief.title,
    brief: [
      brief.company,
      brief.context,
      brief.tasks.map((task, i) => `${i + 1}. ${task}`).join("\n"),
      `Deliverable: ${brief.deliverable}`,
      brief.starterCode ? `Starter code:\n${brief.starterCode}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    submission,
    weaknesses: feedback.improvements,
    interviewQuestions: feedback.interviewQuestions,
  };
}
