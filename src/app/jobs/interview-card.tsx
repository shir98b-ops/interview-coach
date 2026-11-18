import Link from "next/link";
import { Chip } from "@/components/ui";
import { googleCalendarLink } from "@/lib/jobs/calendar";
import { interviewEvent } from "@/lib/jobs/event";
import type { InterviewRow } from "@/lib/jobs/queries";
import { interviewKinds } from "@/lib/jobs/schema";
import { daysUntil, formatInterviewTime, whenLabel } from "@/lib/jobs/time";

const smallButton =
  "inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-bold ring-2 ring-line hover:bg-violet-soft";

/** One interview: when, what kind, and buttons to add it to a calendar. */
export function InterviewCard({
  interview,
  now,
  showJob = true,
  children,
}: {
  interview: InterviewRow;
  now: Date;
  showJob?: boolean;
  children?: React.ReactNode;
}) {
  const days = daysUntil(interview.startsAt, now);
  const past =
    interview.startsAt.getTime() + interview.minutes * 60000 < now.getTime();
  const event = interviewEvent(interview);

  return (
    <li className="bg-canvas flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={past ? "violet" : days <= 1 ? "orange" : "lime"}>
          {past ? "עבר" : whenLabel(days)}
        </Chip>
        <span className="font-bold">{interviewKinds[interview.kind]}</span>
      </div>
      {showJob && (
        <Link
          href={`/jobs/${interview.jobId}`}
          className="text-lg font-extrabold hover:underline"
        >
          <JobName company={interview.company} title={interview.title} />
        </Link>
      )}
      <p className="text-muted">
        {formatInterviewTime(interview.startsAt)} · {interview.minutes} דקות
      </p>
      {interview.location && (
        <p dir="auto" className="text-muted text-right break-words">
          {interview.location}
        </p>
      )}
      {interview.notes && (
        <p dir="auto" className="whitespace-pre-line">
          {interview.notes}
        </p>
      )}
      {!past && (
        <div className="flex flex-wrap gap-2">
          <a
            href={googleCalendarLink(event)}
            target="_blank"
            rel="noopener noreferrer"
            className={smallButton}
          >
            להוסיף ליומן גוגל
          </a>
          <a
            href={`/jobs/interviews/${interview.id}/ics`}
            className={smallButton}
          >
            קובץ ליומן אחר
          </a>
          {children}
        </div>
      )}
      {past && children && <div className="flex gap-2">{children}</div>}
    </li>
  );
}

/** "Company · Title", each part in its own direction, so mixed Hebrew and
 * English names stay readable. */
export function JobName({
  company,
  title,
}: {
  company: string;
  title: string;
}) {
  return (
    <>
      <bdi>{company}</bdi> · <bdi>{title}</bdi>
    </>
  );
}
