export type StageStatus = "done" | "in-progress" | "planned";

export interface Stage {
  number: number;
  title: string;
  summary: string;
  mvp: boolean;
  status: StageStatus;
}

/**
 * The product roadmap, shown on the landing page.
 * Stages 1-6 make up the MVP; later stages extend it.
 */
export const roadmap: Stage[] = [
  {
    number: 1,
    title: "Project foundation",
    summary: "Repository, app skeleton, automated checks and first deployment.",
    mvp: true,
    status: "done",
  },
  {
    number: 2,
    title: "Accounts and data",
    summary: "Google sign-in and a database for profiles and sessions.",
    mvp: true,
    status: "in-progress",
  },
  {
    number: 3,
    title: "Resume and profile",
    summary:
      "Upload a resume, review the extracted details, pick target roles.",
    mvp: true,
    status: "planned",
  },
  {
    number: 4,
    title: "Written interview simulation",
    summary: "Questions tailored to the role and resume, answered in writing.",
    mvp: true,
    status: "planned",
  },
  {
    number: 5,
    title: "Scoring and feedback",
    summary: "Rubric-based scores, improvement tips and a progress history.",
    mvp: true,
    status: "planned",
  },
  {
    number: 6,
    title: "MVP polish and launch",
    summary:
      "End-to-end tests, error handling, usage limits and documentation.",
    mvp: true,
    status: "planned",
  },
  {
    number: 7,
    title: "Jobs I applied to",
    summary: "Add a job link, get a company summary and job-specific practice.",
    mvp: false,
    status: "planned",
  },
  {
    number: 8,
    title: "Voice answers",
    summary: "Record answers, transcribe them and get feedback on delivery.",
    mvp: false,
    status: "planned",
  },
  {
    number: 9,
    title: "Learn by playing",
    summary: "Short take-home style exercises with points and streaks.",
    mvp: false,
    status: "planned",
  },
];

export function currentStage(stages: Stage[] = roadmap): Stage | undefined {
  return stages.find((stage) => stage.status === "in-progress");
}
