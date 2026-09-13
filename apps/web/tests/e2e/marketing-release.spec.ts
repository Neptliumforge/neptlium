import { expect, test } from "@playwright/test";

const primaryRoutes = [
  "/",
  "/platform",
  "/investments",
  "/insights",
  "/security",
  "/company",
];

test.describe("Neptlium premium marketing release", () => {
  for (const route of primaryRoutes) {
    test(`${route} renders successfully`, async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });

      const response = await page.goto(route, {
        waitUntil: "networkidle",
      });

      expect(response).not.toBeNull();
      expect(response!.status()).toBeLessThan(400);

      expect(page.url()).not.toContain("/sso-api");

      await expect(page.locator("body")).toContainText(/neptlium/i);

      const overflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 2
        );
      });

      expect(
        overflow,
        `Horizontal overflow detected on ${route}`,
      ).toBe(false);

      expect(
        consoleErrors,
        `Console errors detected on ${route}:\n${consoleErrors.join("\n")}`,
      ).toEqual([]);
    });
  }

  test("/about redirects to /company", async ({ page }) => {
    await page.goto("/about", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/company\/?$/);
  });

  test("/resources redirects to /insights", async ({ page }) => {
    await page.goto("/resources", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/insights\/?$/);
  });
});
