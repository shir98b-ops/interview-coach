"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const links = [
  { href: "/dashboard", label: "בית" },
  { href: "/practice", label: "תרגול" },
  { href: "/learn", label: "למידה" },
  { href: "/profile", label: "פרופיל" },
];

/** The app's main links. The current page is highlighted once the URL is known. */
export function NavLinks() {
  return (
    <Suspense fallback={<LinkList pathname={null} />}>
      <CurrentLinks />
    </Suspense>
  );
}

function CurrentLinks() {
  return <LinkList pathname={usePathname()} />;
}

function LinkList({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {links.map((link) => {
        const active =
          pathname !== null &&
          (pathname === link.href || pathname.startsWith(`${link.href}/`));
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-4 font-bold ${
                active
                  ? "bg-violet text-white"
                  : "text-ink hover:bg-violet-soft"
              }`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
