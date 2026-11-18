import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * The building blocks of the "energetic" design, so every page shares the
 * same buttons, cards and spacing.
 */

const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-lg font-extrabold transition active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: `${buttonBase} bg-violet text-white shadow-[0_6px_0_var(--color-violet-dark)] hover:brightness-110 active:shadow-[0_2px_0_var(--color-violet-dark)]`,
  lime: `${buttonBase} bg-lime text-ink shadow-[0_6px_0_var(--color-lime-dark)] hover:brightness-105 active:shadow-[0_2px_0_var(--color-lime-dark)]`,
  quiet: `${buttonBase} bg-white text-ink ring-2 ring-line hover:bg-violet-soft`,
} as const;

type Variant = keyof typeof buttonStyles;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button className={`${buttonStyles[variant]} ${className}`} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link className={`${buttonStyles[variant]} ${className}`} {...props} />
  );
}

const cardTones = {
  white: "bg-white shadow-[0_12px_40px_rgba(77,40,200,0.08)]",
  violet: "bg-violet text-white",
  orange: "bg-orange-soft",
  lilac: "bg-violet-soft",
  lime: "bg-success-soft",
} as const;

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
  tone = "orange",
  children,
}: {
  tone?: "orange" | "violet" | "lime";
  children: ReactNode;
}) {
  const tones = {
    orange: "bg-orange-soft text-orange-ink",
    violet: "bg-violet-soft text-violet-dark",
    lime: "bg-success-soft text-success-ink",
  };
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-bold ${tones[tone]}`}
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
          className={`h-2.5 flex-1 rounded-full ${i < done ? "bg-violet" : "bg-line"}`}
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
  "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:border-violet focus:outline-none";
