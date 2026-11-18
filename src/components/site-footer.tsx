import Link from "next/link";

/** The footer on every page, with the privacy link. */
export function SiteFooter() {
  return (
    <footer className="text-muted mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm sm:px-6">
      <span dir="ltr">Interview Coach</span>
      <Link href="/privacy" className="hover:text-violet font-medium">
        פרטיות
      </Link>
    </footer>
  );
}
