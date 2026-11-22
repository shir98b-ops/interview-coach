"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/insights", label: "שימוש ועלויות" },
  { href: "/admin/feedback", label: "משוב משתמשים" },
];

/** Switches between the owner's pages. */
export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="ניהול" className="mx-auto flex w-full max-w-4xl gap-2">
      {tabs.map((tab) => {
        const current = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-full px-5 font-bold ${
              current ? "bg-ink text-white" : "bg-sky-light"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
