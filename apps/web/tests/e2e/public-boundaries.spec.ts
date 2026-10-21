import { expect, test } from '@playwright/test';
import { INDEXABLE_ROUTES } from '../../lib/content/public-architecture';

const publicAccountRoutes = [
  '/auth/access-denied',
  '/auth/create-account',
  '/auth/forgot-password',
  '/auth/loading',
  '/auth/reset-password',
  '/auth/session-expired',
  '/auth/sign-in',
  '/auth/verify-email',
] as const;

for (const route of publicAccountRoutes) {
  test(`${route} retains one main landmark and delegates account access`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    const main = page.getByRole('main');
    await expect(main).toHaveCount(1);
    await expect(main).toHaveAttribute('id', 'main-content');
    await expect(main.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(main.locator('input[type="password"]')).toHaveCount(0);
    await expect(main.locator('form')).toHaveCount(0);
    // Inspect the destination; do not create sessions in another application.
    for (const link of await main.locator('a[href^="https://app.neptlium.com"]').all()) {
      expect(new URL((await link.getAttribute('href'))!).origin).toBe('https://app.neptlium.com');
    }
  });
}

for (const preference of ['light', 'dark', 'system'] as const) {
  for (const route of INDEXABLE_ROUTES) {
    test(`${route} respects ${preference} appearance without overflow`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
      await page.addInitScript((value) => {
        window.localStorage.setItem('neptlium-theme', value);
      }, preference);
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      const root = page.locator('html');
      await expect(root).toHaveAttribute('data-theme-preference', preference);
      const initialTheme = preference === 'dark' ? 'dark' : 'light';
      await expect(root).toHaveAttribute('data-theme', initialTheme);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('banner')).toBeVisible();
      expect(await page.evaluate(() =>
        document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2,
      )).toBe(true);

      // OS changes affect System; explicit preferences must remain authoritative.
      await page.emulateMedia({ colorScheme: 'dark' });
      await expect(root).toHaveAttribute('data-theme', preference === 'system' ? 'dark' : initialTheme);
      if (preference === 'system') {
        await page.emulateMedia({ colorScheme: 'light' });
        await expect(root).toHaveAttribute('data-theme', 'light');
      }
      if (route === '/' || route === '/infrastructure') {
        await page.screenshot({
          path: testInfo.outputPath(`css-baseline-appearance-${route === '/' ? 'home' : 'infrastructure'}-${preference}-${testInfo.project.name}.png`),
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  }
}
