import { expect, test } from '@playwright/test';

const releaseRoutes = [
  '/',
  '/personal',
  '/business',
  '/platform',
  '/investments',
  '/capital',
  '/portfolio',
  '/allocation',
  '/treasury',
  '/insights',
  '/security',
  '/company',
  '/products/capital-account',
  '/products/treasury',
  '/products/allocation',
  '/products/portfolio-intelligence',
  '/solutions/capital-visibility',
  '/resources',
  '/risk-disclosure',
] as const;

const personalSignInUrl = 'https://app.neptlium.com/auth/sign-in';
const personalSignUpUrl = 'https://app.neptlium.com/auth/sign-up';
const businessAppUrl = 'https://vault.neptlium.com';

async function expectNoHorizontalOverflow(page: any) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  expect(overflow, 'Horizontal page overflow detected').toBe(false);
}

async function expectNoApplicationRuntimeErrors(page: any, route: string) {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message: any) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request: any) => {
    failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? 'request failed'}`);
  });

  const response = await page.goto(route, { waitUntil: 'networkidle' });
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  expect(page.url()).not.toContain('/sso-api');
  await expect(page.locator('body')).toContainText(/neptlium/i);
  await expect(page.locator('h1')).toHaveCount(1);
  await expectNoHorizontalOverflow(page);
  expect(consoleErrors, `Console errors detected on ${route}:\n${consoleErrors.join('\n')}`).toEqual([]);
  expect(failedRequests, `Failed requests detected on ${route}:\n${failedRequests.join('\n')}`).toEqual([]);
}

test.describe('Neptlium unified marketing release', () => {
  for (const route of releaseRoutes) {
    test(`${route} renders successfully`, async ({ page }) => {
      await expectNoApplicationRuntimeErrors(page, route);
    });
  }

  test('desktop primary navigation exposes the unified product family', async ({ page }, testInfo) => {
    test.skip(!['desktop-1440', 'laptop-1280'].includes(testInfo.project.name), 'Desktop navigation contract');
    await page.goto('/', { waitUntil: 'networkidle' });
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    for (const label of ['Personal', 'Business', 'Platform', 'Insights', 'Security', 'Company']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    await nav.getByRole('link', { name: 'Business', exact: true }).click();
    await expect(page).toHaveURL(/\/business\/?$/);
  });

  test('desktop account chooser keeps Personal and Business destinations separate', async ({ page }, testInfo) => {
    test.skip(!['desktop-1440', 'laptop-1280'].includes(testInfo.project.name), 'Desktop account chooser contract');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('summary').filter({ hasText: 'Sign in' }).click();
    const openMenu = page.locator('details[open]').filter({ hasText: 'Sign in' });
    await expect(openMenu.getByRole('link', { name: /Personal Neptlium Capital/i })).toHaveAttribute('href', personalSignInUrl);
    await expect(openMenu.getByRole('link', { name: /Business Open VaultRail/i })).toHaveAttribute('href', businessAppUrl);
    await page.locator('summary').filter({ hasText: 'Get started' }).click();
    const startMenu = page.locator('details[open]').filter({ hasText: 'Get started' });
    await expect(startMenu.getByRole('link', { name: /Personal Neptlium Capital/i })).toHaveAttribute('href', personalSignUpUrl);
    await expect(startMenu.getByRole('link', { name: /Business Request VaultRail access/i })).toHaveAttribute('href', '/contact');
  });

  test('mobile navigation preserves both journeys and restores page state', async ({ page }, testInfo) => {
    test.skip(!['mobile-390', 'mobile-360'].includes(testInfo.project.name), 'Mobile navigation contract');
    await page.goto('/', { waitUntil: 'networkidle' });
    const trigger = page.getByRole('button', { name: 'Open navigation' });
    await trigger.focus();
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Navigation' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Personal', exact: true }).first()).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Business', exact: true }).first()).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Open account', exact: false })).toHaveAttribute('href', personalSignUpUrl);
    await expect(dialog.getByRole('link', { name: 'Open VaultRail', exact: true })).toHaveAttribute('href', businessAppUrl);
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await expectNoHorizontalOverflow(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });

  test('homepage brand and journey CTAs remain canonical', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Capital, clearly.' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore Neptlium/i })).toHaveAttribute('href', '#financial-world');
    await expect(page.getByRole('link', { name: /For business/i })).toHaveAttribute('href', '/business');
    await expect(page.getByRole('link', { name: /Explore Personal/i }).first()).toHaveAttribute('href', '/personal');
    await expect(page.getByRole('link', { name: /Explore Business/i }).first()).toHaveAttribute('href', '/business');
    await expect(page.getByRole('link', { name: /Explore Insights/i })).toHaveAttribute('href', '/insights');
  });

  test('about remains the intentional company alias', async ({ page }) => {
    const response = await page.goto('/about', { waitUntil: 'networkidle' });
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/company\/?$/);
  });

  test('current authored supporting routes remain authored pages, not stale aliases', async ({ page }) => {
    for (const route of ['/resources', '/products/capital-account', '/products/treasury', '/products/allocation', '/products/portfolio-intelligence', '/solutions/capital-visibility']) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const current = new URL(page.url()).pathname.replace(/\/$/, '') || '/';
      expect(current, `${route} unexpectedly redirected to a stale canonical destination`).toBe(route);
      await expect(page.locator('h1')).toHaveCount(1);
      await expectNoHorizontalOverflow(page);
    }
  });
});
