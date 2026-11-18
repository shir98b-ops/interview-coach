import { expect, test } from "@playwright/test";

test("the home page explains the product", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /הראיון הבא שלך/, level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "איך זה עובד" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "להתחיל להתאמן" })).toBeVisible();
});

test("the sign-in page offers Google sign-in", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "כניסה" })).toBeVisible();
  await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
});

for (const path of [
  "/dashboard",
  "/profile",
  "/practice",
  "/practice/abc",
  "/learn",
  "/learn/star",
]) {
  test(`signed-out visitors of ${path} are sent to sign in`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page).toHaveURL(`/login?next=${encodeURIComponent(path)}`);
    await expect(page.getByRole("heading", { name: "כניסה" })).toBeVisible();
  });
}

test("an unknown page shows a friendly not-found page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "העמוד לא נמצא" }),
  ).toBeVisible();
});
