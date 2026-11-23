import Link from "next/link";
import type { ReactNode } from "react";
import {
  Avatar,
  ButtonLink,
  Chip,
  Icon,
  ScoreTrend,
  type IconName,
} from "@/components/ui";
import type { NextStep, StepTone } from "@/lib/home/next-step";
import { WEEKLY_GOAL, type WeekDay } from "@/lib/home/week";

const toneBg: Record<StepTone, string> = {
  blue: "bg-sky",
  sky: "bg-sky-light",
  lavender: "bg-lavender",
  mint: "bg-mint",
  pink: "bg-pink",
  sun: "bg-sun",
};

/**
 * Cards that are links lift a little under the mouse and straighten their
 * icon. A tap presses them in slightly, so phones feel the touch.
 */
const lift =
  "transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(20,38,58,0.14)] [&_img]:transition motion-safe:hover:[&_img]:scale-[1.08] motion-safe:hover:[&_img]:rotate-0 motion-safe:active:scale-[.98]";

/** A row of segments, filled up to `done`, on a colored card. */
function Bars({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-[7px] flex-1 rounded-full ${i < done ? "bg-ink" : "bg-ink/20"}`}
        />
      ))}
    </div>
  );
}

function RoundArrow({ light = false }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${light ? "text-ink bg-white/70" : "bg-ink text-white"}`}
    >
      <svg
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
    </span>
  );
}

/** Avatar, greeting and date. On phones the streak sits on the other side. */
export function Greeting({
  name,
  subtitle,
  streakDays,
}: {
  name: string | undefined;
  subtitle: string;
  streakDays: number;
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar name={name} className="flex lg:hidden" />
        <div className="flex flex-col">
          <h1 className="text-2xl leading-tight font-black lg:text-4xl">
            {name ? `היי ${name}` : "היי"}
          </h1>
          <p className="text-muted">{subtitle}</p>
        </div>
      </div>
      {streakDays > 0 && (
        <span className="border-line flex items-center gap-1.5 rounded-full border-[1.5px] bg-white px-4 py-2 font-black lg:hidden">
          <Icon name="fire" size={22} />
          {streakDays === 1 ? "יום אחד" : `${streakDays} ימים`}
        </span>
      )}
      <Avatar name={name} className="hidden lg:flex" />
    </header>
  );
}

/** The main card: one step, its button and its icon beside the text. */
export function NextStepCard({ step }: { step: NextStep }) {
  return (
    <section
      aria-label="הצעד הבא"
      className={`${toneBg[step.tone]} flex items-center gap-4 rounded-[30px] p-6 lg:gap-6 lg:px-8 lg:py-8`}
    >
      <div className="flex flex-1 flex-col gap-2.5">
        <Chip tone={step.tone === "sun" ? "glass" : "blue"}>{step.chip}</Chip>
        <h2 className="text-ink text-[28px] leading-[1.1] font-black lg:text-[38px]">
          {step.title}
        </h2>
        <p className="text-ink text-[15px]">{step.subtitle}</p>
        {step.setup && (
          <div className="max-w-sm">
            <Bars done={step.setup.step} total={step.setup.total} />
          </div>
        )}
        {step.prep && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-extrabold">
              הכנה {step.prep.done} מתוך {step.prep.total}
            </p>
            <Bars done={step.prep.done} total={step.prep.total} />
          </div>
        )}
        <ButtonLink
          href={step.href}
          className="mt-1.5 w-fit whitespace-nowrap lg:min-h-[52px] lg:px-7"
        >
          {step.cta}
        </ButtonLink>
      </div>
      <Icon
        name={step.icon}
        size={120}
        className="h-20 w-20 -rotate-10 sm:h-24 sm:w-24 lg:h-[120px] lg:w-[120px]"
      />
    </section>
  );
}

/** This week's days, with the practiced ones marked, and the weekly goal. */
export function WeekCard({
  days,
  practices,
}: {
  days: WeekDay[];
  practices: number;
}) {
  return (
    <section
      aria-label="השבוע שלך"
      className="flex flex-col gap-5 lg:rounded-[28px] lg:bg-white lg:p-6 lg:shadow-[0_10px_30px_rgba(20,38,58,0.06)]"
    >
      <div className="hidden items-baseline justify-between lg:flex">
        <h2 className="text-lg font-black">השבוע שלך</h2>
        <span className="text-muted text-sm">
          {practices === 1 ? "תרגול אחד" : `${practices} תרגולים`}
        </span>
      </div>
      <ol className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <li
            key={day.date}
            aria-current={day.today ? "date" : undefined}
            className={`flex flex-col items-center gap-0.5 rounded-full py-2.5 ${
              day.today
                ? "bg-blue text-white"
                : "border-line border-[1.5px] bg-white"
            }`}
          >
            <span className={`text-xs ${day.today ? "" : "text-muted"}`}>
              {day.letter}
            </span>
            <span className="text-lg font-black">{day.date}</span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                day.today
                  ? day.practiced
                    ? "bg-[#ffd94d]"
                    : "bg-white/40"
                  : day.practiced
                    ? "bg-blue"
                    : "bg-transparent"
              }`}
            />
            {day.practiced && <span className="sr-only">תרגלת</span>}
          </li>
        ))}
      </ol>
      <div className="bg-canvas hidden items-center gap-3 rounded-[22px] p-4 lg:flex">
        <Icon name="target" size={44} className="rotate-8" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <b className="text-sm">היעד השבועי</b>
            <span className="text-muted text-sm">
              {Math.min(practices, WEEKLY_GOAL)} מתוך {WEEKLY_GOAL}
            </span>
          </div>
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: WEEKLY_GOAL }, (_, i) => (
              <span
                key={i}
                className={`h-[7px] flex-1 rounded-full ${i < practices ? "bg-blue" : "bg-line"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-3 rounded-[26px] p-5 ${lift} ${className}`}
    >
      {children}
    </Link>
  );
}

/**
 * A tile's label, title and icon. On phones the icon shares the first line
 * with the label and the title takes the full width below; on a computer
 * the icon sits beside them all.
 */
function TileHead({
  chip,
  title,
  subtitle,
  icon,
}: {
  chip: ReactNode;
  title?: string;
  subtitle?: string;
  icon: IconName;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1.5">
      <Chip tone="glass">{chip}</Chip>
      <Icon
        name={icon}
        size={56}
        className="col-start-2 row-start-1 h-10 w-10 -rotate-8 lg:row-span-3 lg:h-14 lg:w-14"
      />
      {title && (
        <b className="col-span-2 text-xl leading-tight font-black lg:col-span-1 lg:text-2xl">
          {title}
        </b>
      )}
      {subtitle && (
        <span className="text-ink-soft col-span-2 text-sm lg:col-span-1">
          {subtitle}
        </span>
      )}
    </div>
  );
}

/** An upcoming interview: tall on phones, with the prep bars. */
export function InterviewTile({
  href,
  company,
  when,
  days,
  prepDone,
}: {
  href: string;
  company: string;
  when: string;
  days: number;
  prepDone: number;
}) {
  const chip =
    days <= 0 ? (
      "ראיון היום"
    ) : days === 1 ? (
      "ראיון מחר"
    ) : (
      <>
        ראיון קרוב
        <span className="hidden lg:inline">&nbsp;· בעוד {days} ימים</span>
      </>
    );
  return (
    <Tile href={href} className="bg-sun row-span-2 lg:row-span-1">
      <TileHead chip={chip} title={company} subtitle={when} icon="calendar" />
      <div className="mt-auto flex flex-col gap-3 lg:flex-row-reverse lg:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <b className="text-sm">הכנה {prepDone} מתוך 3</b>
          <Bars done={prepDone} total={3} />
        </div>
        <RoundArrow />
      </div>
    </Tile>
  );
}

export function ScoreTile({
  score,
  change,
  label,
}: {
  score: number;
  change: number | null;
  label: string;
}) {
  return (
    <Tile href="/practice" className="bg-sky-light">
      <TileHead chip="הציון האחרון" subtitle={label} icon="chart" />
      <div className="mt-auto">
        <ScoreTrend score={score} change={change} />
      </div>
    </Tile>
  );
}

export function LessonTile({
  href,
  title,
  minutes,
  summary,
}: {
  href: string;
  title: string;
  minutes: number;
  summary: string;
}) {
  return (
    <Tile href={href} className="bg-lavender">
      <TileHead chip={`שיעור · ${minutes} דק׳`} title={title} icon="book" />
      <p className="text-ink-soft mt-auto hidden text-sm lg:block">{summary}</p>
    </Tile>
  );
}

/** A secondary thing to do while setting up, as a colored row. */
export function LaterRow({
  href,
  icon,
  tone,
  title,
  subtitle,
}: {
  href: string;
  icon: IconName;
  tone: "mint" | "sky";
  title: string;
  subtitle: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`${tone === "mint" ? "bg-mint" : "bg-sky-light"} flex items-center gap-4 rounded-[26px] p-4 ${lift}`}
      >
        <Icon name={icon} size={46} className="-rotate-8" />
        <span className="flex flex-1 flex-col">
          <b className="text-lg leading-tight font-black">{title}</b>
          <span className="text-ink-soft text-sm">{subtitle}</span>
        </span>
        <RoundArrow light />
      </Link>
    </li>
  );
}
