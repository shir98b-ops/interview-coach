/**
 * Accounts that skip the daily usage limits, such as the app owner while
 * testing. The list lives in the UNLIMITED_EMAILS setting on the server
 * (comma separated), so no email address is stored in the code.
 */

export function parseEmailList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.includes("@"));
}

export function hasNoLimits(
  email: string | undefined,
  list: string | undefined = process.env.UNLIMITED_EMAILS,
): boolean {
  if (!email) return false;
  return parseEmailList(list).includes(email.trim().toLowerCase());
}
