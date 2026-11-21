"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

const iconProps = {
  "aria-hidden": true,
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const links: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/dashboard",
    label: "בית",
    icon: (
      <svg {...iconProps}>
        <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    href: "/jobs",
    label: "משרות",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </svg>
    ),
  },
  {
    href: "/practice",
    label: "תרגול",
    icon: (
      <svg {...iconProps}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    ),
  },
  {
    href: "/learn",
    label: "למידה",
    icon: (
      <svg {...iconProps}>
        <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
        <path d="M4 19V5" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "פרופיל",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
];

type Variant = "sidebar" | "tabs";

/**
 * The app's main links: a column with labels in the desktop sidebar, or
 * round icon buttons in the floating bar on phones. The current page is
 * highlighted once the URL is known.
 */
export function NavLinks({ variant }: { variant: Variant }) {
  return (
    <Suspense fallback={<LinkList pathname={null} variant={variant} />}>
      <CurrentLinks variant={variant} />
    </Suspense>
  );
}

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
    <ul
      className={
        tabs ? "flex items-center justify-between" : "flex flex-col gap-1"
      }
    >
      {links.map((link) => {
        const active =
          pathname !== null &&
          (pathname === link.href || pathname.startsWith(`${link.href}/`));
        return (
          <li key={link.href}>
            {tabs ? (
              <Link
                href={link.href}
                aria-label={link.label}
                aria-current={active ? "page" : undefined}
                className={`flex h-[50px] w-[50px] items-center justify-center rounded-full transition active:scale-90 ${
                  active ? "text-ink bg-white" : "text-[#c6d3e3]"
                }`}
              >
                {link.icon}
              </Link>
            ) : (
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-full px-4 text-[15px] transition ${
                  active
                    ? "bg-ink font-extrabold text-white"
                    : "text-ink-soft hover:bg-sky-soft font-semibold"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
