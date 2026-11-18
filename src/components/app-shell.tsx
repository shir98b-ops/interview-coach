import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/login/actions";
import { FeedbackButton } from "./feedback-button";
import { NavLinks } from "./nav-links";
import { SiteFooter } from "./site-footer";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-extrabold">
      <span
        aria-hidden
        className="bg-violet text-lime flex h-9 w-9 items-center justify-center rounded-xl"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
 * The page frame for signed-in screens: logo, navigation, feedback and sign
 * out. On phones the links move to a tab bar at the bottom of the screen.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-line bg-canvas/90 sticky top-0 z-10 border-b backdrop-blur">
        <nav
          aria-label="ראשי"
          className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6"
        >
          <Logo />
          <div className="hidden sm:block">
            <NavLinks />
          </div>
          <div className="flex items-center">
            <FeedbackButton />
            <form action={signOut}>
              <button
                type="submit"
                className="text-muted hover:bg-violet-soft min-h-11 rounded-full px-4 font-medium"
              >
                יציאה
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
      <div className="pb-20 sm:pb-0">
        <SiteFooter />
      </div>
      <nav
        aria-label="ניווט בטלפון"
        className="border-line bg-canvas/95 fixed inset-x-0 bottom-0 z-10 border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden"
      >
        <NavLinks variant="tabs" />
      </nav>
    </>
  );
}

export function Loading() {
  return <p className="text-muted text-lg">רגע, טוען...</p>;
}
