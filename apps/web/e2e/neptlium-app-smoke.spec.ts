import { test, expect } from '@playwright/test';

const baseURL = process.env.NEPTLIUM_APP_QA_URL ?? 'http://127.0.0.1:3001';
const viewports = [
  { name: 'mobile-360', width: 360, height: 780 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
] as const;

for (const viewport of viewports) {
  test(`development sign-in renders at ${viewport.name}`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    try {
      const response = await page.goto(`${baseURL}/auth/sign-in`, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
      await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow, 'Page must not overflow horizontally').toBe(false);
      expect(pageErrors, 'No uncaught browser errors').toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`sign-in-${viewport.name}.png`), fullPage: true });
    } finally {
      await context.close();
    }
  });
}

test('unauthenticated dashboard redirects to sign-in', async ({ page }) => {
  await page.goto(`${baseURL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/auth\/sign-in(?:\?|$)/);
});

test('sign-up form renders without creating an account', async ({ page }) => {
  const response = await page.goto(`${baseURL}/auth/sign-up`, { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
