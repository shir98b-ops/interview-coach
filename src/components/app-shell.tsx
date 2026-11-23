import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { signOut } from "@/app/login/actions";
import { FeedbackButton } from "./feedback-button";
import { NavLinks } from "./nav-links";
import { OwnerLink } from "./owner-link";
import { SiteFooter } from "./site-footer";
import { StreakCard } from "./streak-card";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-black">
      <span
        aria-hidden
        className="bg-ink flex h-[34px] w-[34px] items-center justify-center rounded-[11px] text-[#ffd94d]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4a2 2 0 0 1-2-2z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span dir="ltr" className="whitespace-nowrap">
        Interview Coach
      </span>
    </Link>
  );
}

/**
 * Feedback, the owner's dashboard and sign out. They sit at the bottom of the
 * desktop sidebar, and on the profile page on phones.
 */
export function AccountLinks({
  placement = "below",
}: {
  placement?: "below" | "above";
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Suspense fallback={null}>
        <OwnerLink />
      </Suspense>
      <FeedbackButton placement={placement} />
      <form action={signOut}>
        <button
          type="submit"
          className="text-muted hover:bg-canvas min-h-11 rounded-full px-4 font-medium"
        >
          יציאה
        </button>
      </form>
    </div>
  );
}

/**
 * The page frame for signed-in screens. On a computer the links sit in a
 * white sidebar on the right, with the practice streak at its bottom. On
 * phones and tablets they move to a floating round bar at the bottom.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <aside className="border-line fixed inset-y-0 start-0 z-10 hidden w-58 flex-col gap-7 border-s bg-white px-[18px] py-[26px] lg:flex">
        <div className="px-1.5">
          <Logo />
        </div>
        <nav aria-label="ראשי">
          <NavLinks variant="sidebar" />
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <AccountLinks placement="above" />
          <Suspense fallback={null}>
            <StreakCard />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col lg:ps-58">
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-[18px] py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
        <div className="pb-28 lg:pb-0">
          <SiteFooter />
        </div>
      </div>

      <nav
        aria-label="ניווט ראשי בטלפון"
        className="bg-ink fixed inset-x-[18px] bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 mx-auto h-[66px] max-w-md rounded-full p-2 shadow-[0_10px_24px_rgba(20,38,58,0.25)] lg:hidden"
      >
        <NavLinks variant="tabs" />
      </nav>
    </>
  );
}

export function Loading() {
  return <p className="text-muted text-lg">רגע, טוען...</p>;
}
