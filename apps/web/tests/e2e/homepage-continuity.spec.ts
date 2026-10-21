import { expect, test, type Page } from '@playwright/test';

async function contrast(page: Page, foreground: string, background: string) {
  return page.evaluate(({ foreground, background }) => {
    const luminance = (value: string) => {
      const rgb = value.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => {
        const c = v / 255;
        return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
      });
      return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    };
    const a = luminance(getComputedStyle(document.querySelector(foreground)!).color);
    const b = luminance(getComputedStyle(document.querySelector(background)!).backgroundColor);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  }, { foreground, background });
}

for (const preference of ['light', 'dark', 'system'] as const) {
  test(`homepage preserves cinematic contrast and journeys in ${preference}`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.addInitScript(value => localStorage.setItem('neptlium-theme', value), preference);
    await page.goto('/', { waitUntil: 'networkidle' });
    const hero = page.locator('section[aria-labelledby="home-title"]');
    const header = page.locator('.site-header');
    await expect(page.locator('html')).toHaveAttribute('data-theme', preference === 'dark' ? 'dark' : 'light');
    await expect(header).toHaveCSS('background-color', 'rgb(11, 12, 14)');
    await expect(page.locator('#home-title')).toHaveCSS('color', 'rgb(240, 240, 232)');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Capital, intelligently managed.');
    await expect(hero.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', 'https://app.neptlium.com/auth/sign-up');
    await expect(hero.getByRole('link', { name: 'For institutions' })).toHaveAttribute('href', '/institutional');
    await expect(hero).toContainText('Illustrative interface');
    await expect(hero).toContainText('No customer balances, returns or performance data');
    expect(await contrast(page, '#home-title', 'section[aria-labelledby="home-title"]')).toBeGreaterThan(7);
    expect(await contrast(page, '.site-header .brand', '.site-header')).toBeGreaterThan(7);
    expect(await contrast(page, '[class*="heroCopy"] > p', 'section[aria-labelledby="home-title"]')).toBeGreaterThan(4.5);
    expect(await contrast(page, '[class*="productBar"]', '[class*="productFrame"]')).toBeGreaterThan(4.5);

    const primary = hero.getByRole('link', { name: 'Get started' });
    const secondary = hero.getByRole('link', { name: 'For institutions' });
    for (const action of [primary, secondary]) {
      expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await action.focus();
      await expect(action).toHaveCSS('outline-style', 'solid');
      await expect(action).toHaveCSS('outline-width', '2px');
    }
    if (testInfo.project.use.viewport!.width >= 980) {
      const nav = page.getByRole('navigation', { name: 'Primary navigation' });
      const products = nav.getByRole('link', { name: 'Products', exact: true });
      const solutions = nav.getByRole('link', { name: 'Solutions', exact: true });
      const a = (await products.boundingBox())!;
      const b = (await solutions.boundingBox())!;
      expect(b.x - a.x - a.width).toBeGreaterThanOrEqual(12);
      expect(await contrast(page, '.command-nav-group > a', '.site-header')).toBeGreaterThan(4.5);
      await products.focus();
      await expect(nav.getByRole('link', { name: /Portfolio/ }).first()).toBeVisible();
    } else {
      const trigger = page.getByRole('button', { name: 'Open navigation' });
      await trigger.click();
      await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
    await page.mouse.click(2, 2);
    await page.evaluate(() => scrollTo(0, 0));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    // The homepage deliberately preserves its cinematic dark hero and
    // mixed editorial surfaces in both explicit theme preferences.
    // Identical light/dark visual baselines are therefore intentional.
    if (['desktop-1440', 'mobile-390'].includes(testInfo.project.name) && preference !== 'system') {
      await expect(page).toHaveScreenshot(`homepage-${preference}.png`, { animations: 'disabled', maxDiffPixelRatio: .005 });
    }
    await page.screenshot({ path: testInfo.outputPath(`css-baseline-homepage-${preference}-${testInfo.project.name}.png`), animations: 'disabled' });
    await page.evaluate(() => scrollTo(0, 700));
    await expect(header).toHaveAttribute('data-scrolled', 'true');
    await expect(header).toHaveCSS('background-color', 'rgb(11, 12, 14)');
    expect(await contrast(page, '.site-header .brand', '.site-header')).toBeGreaterThan(7);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', preference === 'system' ? 'dark' : preference);
    await expect(header).toHaveCSS('background-color', 'rgb(11, 12, 14)');
    await page.getByRole('link', { name: 'Neptlium home' }).first().focus();
  });
}
