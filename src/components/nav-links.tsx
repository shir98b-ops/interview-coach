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
export function NavLinks({ variant = "header" }: { variant?: Variant }) {
  return (
    <Suspense fallback={<LinkList pathname={null} variant={variant} />}>
      <CurrentLinks variant={variant} />
    </Suspense>
  );
}

type Variant = "header" | "tabs";

function CurrentLinks({ variant }: { variant: Variant }) {
  return <LinkList pathname={usePathname()} variant={variant} />;
}

function LinkList({
  pathname,
  variant,
}: {
  pathname: string | null;
  variant: Variant;
}) {
  const tabs = variant === "tabs";
  return (
    <ul className={tabs ? "grid grid-cols-4 gap-1" : "flex flex-wrap gap-1"}>
      {links.map((link) => {
        const active =
          pathname !== null &&
          (pathname === link.href || pathname.startsWith(`${link.href}/`));
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`${
                tabs
                  ? "flex min-h-12 w-full justify-center rounded-2xl"
                  : "inline-flex min-h-11 rounded-full px-4"
              } items-center font-bold ${
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
