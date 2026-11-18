/** Pages that require a signed-in user. */
export const protectedPrefixes = ["/dashboard", "/profile", "/practice"];

export function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Only allow redirects to paths inside this app, so a crafted sign-in link
 * cannot send the user to another site.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}
