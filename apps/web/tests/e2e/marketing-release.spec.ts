import { expect, test } from '@playwright/test';

const releaseRoutes = [
  '/',
  '/platform',
  '/investments',
  '/capital',
  '/portfolio',
  '/allocation',
  '/treasury',
  '/payments',
  '/insights',
  '/security',
  '/learn',
  '/research',
  '/company',
  '/contact',
  '/trust',
  '/risk-disclosure',
] as const;

const personalSignInUrl = 'https://app.neptlium.com/auth/sign-in';
const personalSignUpUrl = 'https://app.neptlium.com/auth/sign-up';
const businessAppUrl = 'https://treasury.neptlium.com';

async function expectNoHorizontalOverflow(page: any) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  );
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
  expect(
    consoleErrors,
    `Console errors detected on ${route}:\n${consoleErrors.join('\n')}`,
  ).toEqual([]);
  expect(
    failedRequests,
    `Failed requests detected on ${route}:\n${failedRequests.join('\n')}`,
  ).toEqual([]);
}

test.describe('Neptlium unified marketing release', () => {
  for (const route of releaseRoutes) {
    test(`${route} renders successfully`, async ({ page }) => {
      await expectNoApplicationRuntimeErrors(page, route);
    });
  }

  test('/allocation exposes exactly one authored H1', async ({ page }) => {
    await page.goto('/allocation', { waitUntil: 'networkidle' });
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(/Shape how your capital is arranged\./);
  });

  test('Docs and Status Web routes hand off to their canonical products', async ({ page }) => {
    await page.goto('/docs');
    await expect(page).toHaveURL(/^https:\/\/docs\.neptlium\.com\/?$/);
    await page.goto('/status');
    await expect(page).toHaveURL(/^https:\/\/status\.neptlium\.com\/?$/);
  });

  test('desktop primary navigation exposes the unified product family', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['desktop-1440', 'laptop-1280'].includes(testInfo.project.name),
      'Desktop navigation contract',
    );
    await page.goto('/', { waitUntil: 'networkidle' });
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    for (const label of ['Individuals', 'Institutions', 'Investments', 'Company']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    await nav.getByRole('link', { name: 'Institutions', exact: true }).click();
    await expect(page).toHaveURL(/\/institutional\/?$/);
  });


  test('mobile navigation preserves both journeys and restores page state', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['mobile-390', 'mobile-360'].includes(testInfo.project.name),
      'Mobile navigation contract',
    );
    await page.goto('/', { waitUntil: 'networkidle' });
    const trigger = page.getByRole('button', { name: 'Open navigation' });
    await trigger.focus();
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Navigation' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Individuals', exact: true }).first()).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Institutions', exact: true }).first()).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Open account', exact: false })).toHaveAttribute(
      'href',
      personalSignUpUrl,
    );
    await expect(
      dialog.getByRole('link', { name: 'Open Neptlium Treasury', exact: true }),
    ).toHaveAttribute('href', businessAppUrl);
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await expectNoHorizontalOverflow(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });

  test('homepage brand and journey CTAs remain canonical', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(
      page.getByRole('heading', { name: 'Capital, intelligently managed.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Get started/i }).first()).toHaveAttribute(
      'href',
      'https://app.neptlium.com/auth/sign-up',
    );
    await expect(page.getByRole('link', { name: /For institutions/i })).toHaveAttribute(
      'href',
      '/institutional',
    );
    await expect(page.getByRole('link', { name: /Explore Capital/i }).first()).toHaveAttribute(
      'href',
      '/capital',
    );
    await expect(page.getByRole('link', { name: /Explore Treasury/i }).first()).toHaveAttribute(
      'href',
      '/treasury',
    );
  });

  test('legacy product identities redirect to canonical Capital and Treasury', async ({ page }) => {
    await page.goto('/personal');
    await expect(page).toHaveURL(/\/capital\/?$/);
    await page.goto('/business');
    await expect(page).toHaveURL(/\/treasury\/?$/);
  });

  test('about remains the intentional company alias', async ({ page }) => {
    const response = await page.goto('/about', { waitUntil: 'networkidle' });
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/company\/?$/);
  });

  test('legacy resources route resolves to canonical Insights', async ({ page }) => {
    await page.goto('/resources', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/insights\/?$/);
  });
});
