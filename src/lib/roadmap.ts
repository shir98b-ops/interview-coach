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
    status: "done",
  },
  {
    number: 3,
    title: "Resume and profile",
    summary:
      "Upload a resume, review the extracted details, pick target roles.",
    mvp: true,
    status: "done",
  },
  {
    number: 4,
    title: "Written interview simulation",
    summary: "Questions tailored to the role and resume, answered in writing.",
    mvp: true,
    status: "done",
  },
  {
    number: 5,
    title: "Scoring and feedback",
    summary: "Rubric-based scores, improvement tips and a progress history.",
    mvp: true,
    status: "done",
  },
  {
    number: 6,
    title: "MVP polish and launch",
    summary:
      "A fresh Hebrew design, lessons, take-home practice, resume rating, privacy and account deletion.",
    mvp: true,
    status: "done",
  },
  {
    number: 7,
    title: "Jobs and interview tracker",
    summary:
      "Track jobs applied to and upcoming interviews, with prep plans, time tips and calendar sync.",
    mvp: false,
    status: "in-progress",
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
    summary: "Points, streaks and more lessons on top of the learning area.",
    mvp: false,
    status: "planned",
  },
];

export function currentStage(stages: Stage[] = roadmap): Stage | undefined {
  return stages.find((stage) => stage.status === "in-progress");
}
