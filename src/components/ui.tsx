import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * The building blocks of the "playful" design, so every page shares the
 * same buttons, cards and spacing. Each screen has one primary (navy)
 * button for its main action; every other button is the quiet white one.
 */

const buttonBase =
  "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-extrabold transition duration-150 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[.98] disabled:pointer-events-none disabled:opacity-60";

export const buttonStyles = {
  primary: `${buttonBase} bg-ink text-white hover:shadow-[0_8px_18px_rgba(20,38,58,0.25)]`,
  quiet: `${buttonBase} border-[1.5px] border-line bg-white text-ink font-bold hover:bg-[#eef1f6]`,
} as const;

type Variant = keyof typeof buttonStyles;

/** The small triangle at the end of a primary button, pointing forward. */
function Arrow() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M16 5v14L5 12z" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button className={`${buttonStyles[variant]} ${className}`} {...props}>
      {children}
      {variant === "primary" && <Arrow />}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link className={`${buttonStyles[variant]} ${className}`} {...props}>
      {children}
      {variant === "primary" && <Arrow />}
    </Link>
  );
}

/**
 * Card colors. "blue" is the main card of a screen (the next step), "sun"
 * is reserved for upcoming interviews, and the rest give each area its own
 * pastel.
 */
const onColor = "[&_.text-muted]:text-ink-soft";
const cardTones = {
  white: "bg-white shadow-[0_10px_30px_rgba(20,38,58,0.06)]",
  blue: `bg-sky ${onColor}`,
  sky: `bg-sky-light ${onColor}`,
  pink: `bg-pink ${onColor}`,
  lavender: `bg-lavender ${onColor}`,
  mint: `bg-mint ${onColor}`,
  sun: `bg-sun ${onColor}`,
  question: `bg-lavender-deep ${onColor}`,
} as const;

/** Colors for a row of tiles, so neighbors never share a color. */
export const tileTones = ["sky", "lavender", "mint", "pink"] as const;

export function Card({
  tone = "white",
  className = "",
  children,
  ...props
}: ComponentProps<"div"> & { tone?: keyof typeof cardTones }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-[28px] p-6 ${cardTones[tone]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Chip({
  tone = "pink",
  children,
}: {
  tone?: "pink" | "blue" | "mint" | "glass";
  children: ReactNode;
}) {
  const tones = {
    pink: "text-pink-ink",
    blue: "text-[#0b3a80]",
    mint: "text-success-ink",
    glass: "text-ink",
  };
  return (
    <span
      className={`ring-ink/5 inline-flex w-fit items-center rounded-full bg-white/60 px-2.5 py-1 text-xs font-extrabold ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** A row of segments, one per step, filled up to `done`. */
export function StepBar({ total, done }: { total: number; done: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 flex-1 rounded-full ${i < done ? "bg-blue" : "bg-line"}`}
        />
      ))}
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      {subtitle && <p className="text-muted text-lg">{subtitle}</p>}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-danger font-medium">
      {children}
    </p>
  );
}

export const inputStyles =
  "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:border-blue focus:outline-none";

/**
 * One of the app's 3D icons (Fluent Emoji 3D by Microsoft, MIT licensed).
 * Icons are decoration: they sit beside their text, never above it, and the
 * text carries the meaning.
 */
export type IconName =
  | "book"
  | "briefcase"
  | "bulb"
  | "calendar"
  | "chart"
  | "clipboard"
  | "fire"
  | "laptop"
  | "memo"
  | "microphone"
  | "page"
  | "puzzle"
  | "speech"
  | "target"
  | "trophy";

export function Icon({
  name,
  size = 48,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/icons/${name}.png`}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 drop-shadow-[0_8px_10px_rgba(11,42,92,0.2)] ${className}`}
    />
  );
}

/**
 * A score is never shown alone: it comes with the change since the last
 * comparable practice, when there is one.
 */
export function ScoreTrend({
  score,
  change,
}: {
  score: number;
  change: number | null;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-2.5">
      <p dir="ltr" className="text-5xl leading-none font-black">
        {score}
        <span className="text-base font-bold text-[#3d5a80]"> /100</span>
      </p>
      {change !== null && (
        <span
          className={`text-sm font-extrabold ${change < 0 ? "text-pink-ink" : "text-[#1d5b36]"}`}
        >
          {change === 0
            ? "כמו בפעם הקודמת"
            : `\u200e${change > 0 ? "+" : ""}${change} מהקודם`}
        </span>
      )}
    </div>
  );
}
