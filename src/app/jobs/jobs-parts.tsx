import Link from "next/link";
import { ButtonLink, Chip, Icon } from "@/components/ui";
import { PREP_GOAL } from "@/lib/home/next-step";
import type { InterviewRow } from "@/lib/jobs/queries";
import { jobStatuses, type JobStatus } from "@/lib/jobs/schema";
import { APP_TIME_ZONE, daysUntil, whenLabel } from "@/lib/jobs/time";

export type Job = {
  id: string;
  company: string;
  title: string;
  status: JobStatus;
};

export function Tab({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`inline-flex min-h-11 items-center rounded-full px-5 ${
        current
          ? "bg-ink font-extrabold text-white"
          : "border-line text-muted border-[1.5px] bg-white font-medium"
      }`}
    >
      {children}
    </Link>
  );
}

/** The next interview, in yellow, with the prep done for it. */
export function NextInterview({
  interview,
  now,
  prepDone,
}: {
  interview: InterviewRow;
  now: Date;
  prepDone: number;
}) {
  const days = daysUntil(interview.startsAt, now);
  const when = whenLabel(days);
  return (
    <section
      aria-label="הראיון הבא"
      className="bg-sun flex flex-col gap-4 rounded-[30px] p-6 lg:flex-row lg:items-center lg:gap-8 lg:px-8"
    >
      <div className="flex flex-1 items-start gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Chip tone="glass">הראיון הבא</Chip>
          <h2 className="text-[32px] leading-tight font-black lg:truncate lg:text-[30px]">
            {when}
            <span className="hidden lg:inline"> · {interview.company}</span>
          </h2>
          <p className="text-ink-soft">
            <span className="lg:hidden">
              {interview.company} · {interview.title} ·{" "}
              {weekdayTime(interview.startsAt)}
            </span>
            <span className="hidden lg:inline">
              {interview.title} · {shortWhen(interview.startsAt)}
            </span>
          </p>
        </div>
        <Icon
          name="calendar"
          size={96}
          className="h-20 w-20 rotate-8 lg:order-first lg:h-24 lg:w-24"
        />
      </div>
      <div className="flex items-end gap-4 lg:w-56">
        <div className="flex flex-1 flex-col gap-1.5">
          <b className="text-sm">
            הכנה {prepDone} מתוך {PREP_GOAL}
          </b>
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: PREP_GOAL }, (_, i) => (
              <span
                key={i}
                className={`h-[7px] flex-1 rounded-full ${i < prepDone ? "bg-ink" : "bg-ink/20"}`}
              />
            ))}
          </div>
        </div>
        <Link
          href={`/jobs/${interview.jobId}`}
          aria-label="להמשיך להתכונן"
          className="bg-ink flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[.98] lg:hidden"
        >
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </Link>
      </div>
      <span className="hidden lg:block">
        <ButtonLink
          href={`/jobs/${interview.jobId}`}
          className="whitespace-nowrap lg:min-h-[52px] lg:px-7"
        >
          להמשיך להתכונן
        </ButtonLink>
      </span>
    </section>
  );
}

export function JobRow({
  job,
  color,
  nextAction,
}: {
  job: Job;
  color: string;
  nextAction: string;
}) {
  const status = jobStatuses[job.status];
  return (
    <li>
      <Link
        href={`/jobs/${job.id}`}
        className={`${color} flex items-center gap-4 rounded-[26px] p-4 transition duration-200 hover:shadow-[0_14px_28px_rgba(20,38,58,0.14)] motion-safe:hover:-translate-y-1 lg:px-6`}
      >
        <Icon name="briefcase" size={46} className="-rotate-8" />
        <span className="flex min-w-0 flex-1 flex-col lg:max-w-56">
          <b dir="auto" className="truncate text-right text-lg font-black">
            {job.company || "בלי שם חברה"}
          </b>
          <span
            dir="auto"
            className="text-ink-soft truncate text-right text-sm"
          >
            {job.title}
          </span>
        </span>
        {nextAction && (
          <span className="text-ink-soft hidden flex-1 text-center lg:block">
            הצעד הבא: {nextAction}
          </span>
        )}
        <Chip tone="glass">{status.label}</Chip>
        <span
          aria-hidden
          className="text-ink hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 lg:flex"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </span>
      </Link>
    </li>
  );
}

/** "שלישי 10:00" */
function weekdayTime(date: Date): string {
  const zone = { timeZone: APP_TIME_ZONE } as const;
  const weekday = new Intl.DateTimeFormat("he-IL", { ...zone, weekday: "long" })
    .format(date)
    .replace(/^יום /, "");
  const time = new Intl.DateTimeFormat("he-IL", {
    ...zone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${weekday} ${time}`;
}

/** "שלישי · 24.11 · 10:00" */
function shortWhen(date: Date): string {
  const zone = { timeZone: APP_TIME_ZONE } as const;
  const weekday = new Intl.DateTimeFormat("he-IL", { ...zone, weekday: "long" })
    .format(date)
    .replace(/^יום /, "");
  const day = new Intl.DateTimeFormat("he-IL", {
    ...zone,
    day: "numeric",
    month: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("he-IL", {
    ...zone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${weekday} · ${day} · ${time}`;
}
