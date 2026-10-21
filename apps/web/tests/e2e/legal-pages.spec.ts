import { expect, test } from '@playwright/test';

const legalRoutes = [
  ['/terms', 'Terms of Service'],
  ['/privacy', 'Privacy Policy'],
  ['/risk-disclosure', 'Financial and Digital Asset Risk Disclosures'],
  ['/e-delivery', 'Electronic Communications and E-Delivery'],
  ['/cookie-policy', 'Cookie Policy'],
  ['/aml-kyc', 'AML/KYC Policy Summary'],
  ['/complaints', 'Complaints and Support'],
  ['/accessibility', 'Accessibility Statement'],
] as const;

test.describe('legal documents', () => {
  for (const [route, title] of legalRoutes) {
    test(`${route} renders a reviewable legal document`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(title);
      await expect(page.getByRole('definition').first()).toBeVisible();
      await expect(page.getByLabel('Document status')).toContainText('Version');
      await expect(page.getByRole('navigation', { name: 'On this page' })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      );
      expect(overflow, 'Horizontal page overflow detected').toBe(false);
      if (route !== '/accessibility') {
        await expect(page.getByRole('note', { name: 'Draft notice' })).toBeVisible();
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      }
    });
  }

  test('legal centre and footer reach every legal document', async ({ page }) => {
    await page.goto('/legal', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toHaveText('Legal documents');
    for (const [route] of legalRoutes) {
      await expect(page.locator(`main a[href="${route}"]`).first()).toBeAttached();
      await expect(page.getByRole('navigation', { name: 'Legal' }).locator(`a[href="${route}"]`)).toBeAttached();
    }
  });

  test('contents are collapsed on phones and expanded on wide screens', async ({ page }, testInfo) => {
    await page.goto('/privacy', { waitUntil: 'networkidle' });
    const firstLink = page.getByRole('navigation', { name: 'On this page' }).getByRole('link').first();
    if (testInfo.project.name.startsWith('mobile')) await expect(firstLink).toBeHidden();
    if (['desktop-1440', 'laptop-1280'].includes(testInfo.project.name)) await expect(firstLink).toBeVisible();
  });

  test('section contents link to in-page anchors', async ({ page }) => {
    await page.goto('/terms', { waitUntil: 'networkidle' });
    const contents = page.getByRole('navigation', { name: 'On this page' });
    const target = contents.getByRole('link', { name: 'Governing law and disputes' });
    // Collapsed on small screens; expanded in the wide-screen sidebar.
    if (!(await target.isVisible())) await contents.locator('summary').click();
    await target.click();
    await expect(page).toHaveURL(/\/terms#law$/);
    await expect(page.locator('#law')).toBeInViewport();
  });
});
