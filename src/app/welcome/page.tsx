import type { Metadata } from "next";
import { Logo } from "@/components/app-shell";
import { Arrow, Chip, Icon, type IconName } from "@/components/ui";
import { finishWelcome } from "./actions";

export const metadata: Metadata = { title: "ברוכים הבאים · Interview Coach" };

const steps: {
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
}[] = [
  {
    title: "מעלים קורות חיים",
    subtitle: "ובוחרים תפקיד",
    icon: "page",
    color: "bg-lavender",
  },
  {
    title: "מתרגלים ראיון",
    subtitle: "חמש שאלות, בדיבור או בכתב",
    icon: "microphone",
    color: "bg-mint",
  },
  {
    title: "מקבלים ציון ומשוב",
    subtitle: "ולומדים מה חסר",
    icon: "chart",
    color: "bg-pink",
  },
];

/**
 * The first screen a new user sees: what the app is for, the three steps,
 * and one button to start. It replaces the old six-step tour.
 */
export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-[18px] pt-8 pb-8 sm:px-6">
      <div className="mb-2">
        <Logo />
      </div>

      <section className="bg-sky flex items-center gap-3 rounded-[30px] p-6">
        <div className="flex flex-1 flex-col items-start gap-3">
          <Chip tone="glass">בואו נתחיל</Chip>
          <h1 className="text-[30px] leading-[1.1] font-black text-[#0b2a5c] sm:text-[34px]">
            מגיעים לראיון מוכנים באמת
          </h1>
          <p className="text-[#1f3f6e]">
            שאלות שמתאימות לך ומשוב כנה על כל תשובה
          </p>
        </div>
        <Icon
          name="target"
          size={120}
          className="h-20 w-20 shrink-0 -rotate-10 sm:h-[110px] sm:w-[110px]"
        />
      </section>

      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={`${step.color} flex items-center gap-4 rounded-[26px] px-4 py-4`}
          >
            <span
              aria-hidden
              className="bg-ink flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
            >
              {i + 1}
            </span>
            <span className="flex flex-1 flex-col">
              <b className="text-lg leading-tight font-black">{step.title}</b>
              <span className="text-ink-soft text-[15px]">{step.subtitle}</span>
            </span>
            <Icon
              name={step.icon}
              size={56}
              className="h-12 w-12 -rotate-10 sm:h-14 sm:w-14"
            />
          </li>
        ))}
      </ol>

      <form action={finishWelcome} className="mt-auto flex flex-col gap-3 pt-8">
        <button
          type="submit"
          name="next"
          value="/profile"
          className="bg-ink inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full px-6 text-lg font-extrabold text-white transition duration-150 hover:shadow-[0_8px_18px_rgba(20,38,58,0.25)] motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[.98]"
        >
          להתחיל: להעלות קורות חיים
          <Arrow />
        </button>
        <button
          type="submit"
          name="next"
          value="/dashboard"
          className="text-muted hover:text-ink min-h-11 underline underline-offset-4"
        >
          להסתכל קודם באתר
        </button>
      </form>
    </main>
  );
}
