import { expect, test } from "@playwright/test";

const releaseRoutes = ["/", "/platform", "/investments", "/insights", "/security", "/company", "/products/capital-account", "/solutions/capital-visibility", "/risk-disclosure"];
const signInUrl = "https://app.neptlium.com/auth/sign-in";
const signUpUrl = "https://app.neptlium.com/auth/sign-up";

async function expectNoHorizontalOverflow(page: Parameters<typeof test>[0] extends never ? never : any) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  expect(overflow, "Horizontal page overflow detected").toBe(false);
}

test.describe("Neptlium premium marketing release", () => {
  for (const route of releaseRoutes) {
    test(`${route} renders successfully`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("requestfailed", (request) => { const failure = request.failure(); failedRequests.push(`${request.url()} :: ${failure?.errorText ?? "request failed"}`); });
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response).not.toBeNull();
      expect(response!.status()).toBeLessThan(400);
      expect(page.url()).not.toContain("/sso-api");
      await expect(page.locator("body")).toContainText(/neptlium/i);
      await expect(page.locator("h1")).toHaveCount(1);
      await expectNoHorizontalOverflow(page);
      expect(consoleErrors, `Console errors detected on ${route}:\n${consoleErrors.join("\n")}`).toEqual([]);
      expect(failedRequests, `Failed browser requests detected on ${route}:\n${failedRequests.join("\n")}`).toEqual([]);
    });
  }

  test("desktop primary navigation and account actions are reachable", async ({ page }, testInfo) => {
    test.skip(!["desktop-1440", "laptop-1280"].includes(testInfo.project.name), "Desktop navigation contract");
    await page.goto("/", { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    for (const label of ["Platform", "Investments", "Capital", "Insights", "Security", "Company"]) await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in", exact: true }).first()).toHaveAttribute("href", signInUrl);
    await expect(page.getByRole("link", { name: "Open account", exact: true }).first()).toHaveAttribute("href", signUpUrl);
    await nav.getByRole("link", { name: "Platform", exact: true }).click();
    await expect(page).toHaveURL(/\/platform\/?$/);
  });

  test("mobile navigation traps the release paths and restores page state", async ({ page }, testInfo) => {
    test.skip(!["mobile-390", "mobile-360"].includes(testInfo.project.name), "Mobile navigation contract");
    await page.goto("/", { waitUntil: "networkidle" });
    const trigger = page.getByRole("button", { name: "Open navigation" });
    await expect(trigger).toBeVisible();
    await trigger.focus();
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Navigation" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Platform", exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Investments", exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Capital", exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Open account", exact: false })).toHaveAttribute("href", signUpUrl);
    await expect(dialog.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", signInUrl);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expectNoHorizontalOverflow(page);
    const menuShot = await page.screenshot({ fullPage: true });
    await testInfo.attach("mobile-navigation", { body: menuShot, contentType: "image/png" });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await trigger.click();
    await dialog.getByRole("button", { name: "Close navigation" }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("homepage conversion destinations remain canonical", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: "Explore Neptlium", exact: true })).toHaveAttribute("href", "/platform");
    await expect(page.getByRole("link", { name: "Explore Investments", exact: true })).toHaveAttribute("href", "/investments");
    await expect(page.getByRole("link", { name: "Explore Capital", exact: true })).toHaveAttribute("href", "/products/capital-account");
    await expect(page.getByRole("link", { name: "Explore Treasury", exact: true })).toHaveAttribute("href", "/products/treasury");
    await expect(page.getByRole("link", { name: "Sign in", exact: true }).first()).toHaveAttribute("href", signInUrl);
    await expect(page.getByRole("link", { name: /Open account/i }).first()).toHaveAttribute("href", signUpUrl);
    const finalConversion = page.locator("section[aria-labelledby='global-conversion-title']");
    await expect(finalConversion.getByRole("link", { name: /Open account/i })).toHaveAttribute("href", signUpUrl);
    await expect(finalConversion.getByRole("link", { name: "Explore the platform", exact: true })).toHaveAttribute("href", "/platform");
  });

  test("homepage visual evidence is captured at the release viewport", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expectNoHorizontalOverflow(page);
    const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
    await testInfo.attach(`homepage-${testInfo.project.name}`, { body: screenshot, contentType: "image/png" });
  });

  test("reduced-motion rendering remains functional", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("/about redirects to /company", async ({ page }) => { const response = await page.goto("/about", { waitUntil: "networkidle" }); expect(response).not.toBeNull(); expect(response!.status()).toBeLessThan(400); await expect(page).toHaveURL(/\/company\/?$/); });
  test("/resources redirects to /insights", async ({ page }) => { const response = await page.goto("/resources", { waitUntil: "networkidle" }); expect(response).not.toBeNull(); expect(response!.status()).toBeLessThan(400); await expect(page).toHaveURL(/\/insights\/?$/); });
});
