import { expect, test, type Page } from '@playwright/test';

const routes = ['/infrastructure', '/intelligence', '/institutional', '/products'] as const;
const preferences = ['dark', 'light', 'system'] as const;
const before = process.env.NEPTLIUM_VISUAL_PHASE === 'before';

async function contrast(page: Page, selector: string, backgroundSelector: string) {
  return page.evaluate(({ selector, backgroundSelector }) => {
    function rgb(value: string) {
      const values = value.match(/[\d.]+/g)?.map(Number);
      if (!values || values.length < 3) throw new Error(`Unsupported computed color ${value}`);
      return values.slice(0, 3);
    }
    function luminance(color: number[]) {
      const channels = color.map((value) => value / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    }
    const element = document.querySelector(selector);
    const background = document.querySelector(backgroundSelector);
    if (!element || !background) throw new Error('Missing contrast target');
    const foreground = luminance(rgb(getComputedStyle(element).color));
    const surface = luminance(rgb(getComputedStyle(background).backgroundColor));
    return (Math.max(foreground, surface) + 0.05) / (Math.min(foreground, surface) + 0.05);
  }, { selector, backgroundSelector });
}

for (const route of routes) {
  for (const preference of preferences) {
    test(`${route} ${preference}: semantic surfaces, contrast and responsive layout`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      await page.addInitScript((preference) => localStorage.setItem('neptlium-theme', preference), preference);
      await page.goto(route, { waitUntil: 'networkidle' });
      const slug = route.slice(1);
      const visualSample = ['infrastructure', 'intelligence'].includes(slug)
        && ['desktop-1440', 'mobile-390'].includes(testInfo.project.name)
        && preference !== 'system';

      if (before) {
        if (visualSample) {
          await page.screenshot({ path: testInfo.outputPath(`before-${slug}-${preference}-${testInfo.project.name}.png`), fullPage: true, animations: 'disabled' });
        }
        return;
      }

      const resolved = preference === 'light' ? 'light' : 'dark';
      await expect(page.locator('html')).toHaveAttribute('data-theme', resolved);
      await expect(page.locator('html')).toHaveAttribute('data-theme-preference', preference);
      const family = page.locator('.family-page');
      await expect(family).toHaveCSS('background-color', resolved === 'dark' ? 'rgb(11, 12, 14)' : 'rgb(244, 245, 242)');
      await expect(page.locator('.family-grid')).toHaveCSS('background-color', resolved === 'dark' ? 'rgb(17, 18, 20)' : 'rgb(251, 252, 249)');
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)).toBe(true);
      const shell = await page.locator('.family-shell').boundingBox();
      expect(shell?.x).toBeGreaterThanOrEqual(19);
      expect(shell?.width).toBeLessThan(testInfo.project.use.viewport!.width);
      expect(await contrast(page, '.family-label', '.family-page')).toBeGreaterThanOrEqual(4.5);
      expect(await contrast(page, '.family-card > p', '.family-grid')).toBeGreaterThanOrEqual(4.5);
      expect(await contrast(page, '.family-card h2', '.family-grid')).toBeGreaterThanOrEqual(4.5);
      await expect(page.locator('.site-header')).toHaveCSS('background-color', resolved === 'dark' ? 'rgb(17, 18, 20)' : 'rgb(251, 252, 249)');
      expect(await contrast(page, '.site-header .brand', '.site-header')).toBeGreaterThanOrEqual(4.5);
      if (testInfo.project.use.viewport!.width >= 980) {
        expect(await contrast(page, '.desktop-command-nav a', '.site-header')).toBeGreaterThanOrEqual(4.5);
      }
      const actionSelector = route === '/products' ? '.family-card > a' : '.family-action-primary';
      const action = page.locator(actionSelector).first();
      const actionBox = await action.boundingBox();
      expect(actionBox?.height).toBeGreaterThanOrEqual(44);
      if (route !== '/products') {
        expect(await contrast(page, actionSelector, actionSelector)).toBeGreaterThanOrEqual(4.5);
        await action.hover();
        expect(await contrast(page, actionSelector, actionSelector)).toBeGreaterThanOrEqual(4.5);
        await action.focus();
        await expect(action).toHaveCSS('outline-style', 'solid');
        await expect(action).toHaveCSS('outline-width', '2px');
        await page.keyboard.press('Tab');
        await action.scrollIntoViewIfNeeded();
        const pressedBox = await action.boundingBox();
        if (!pressedBox) throw new Error('Missing action bounds');
        await page.mouse.move(pressedBox.x + pressedBox.width / 2, pressedBox.y + pressedBox.height / 2);
        await page.mouse.down();
        expect(await contrast(page, actionSelector, actionSelector)).toBeGreaterThanOrEqual(4.5);
        await page.mouse.move(2, 2);
        await page.mouse.up();
      }
      const closing = page.locator('.marketing-conversion');
      await expect(closing).toHaveCSS('background-color', resolved === 'dark' ? 'rgb(17, 18, 20)' : 'rgb(251, 252, 249)');
      expect(await contrast(page, '.elite-conversion-primary', '.elite-conversion-primary')).toBeGreaterThanOrEqual(4.5);
      await page.mouse.click(2, 2);
      await page.evaluate(() => document.fonts.ready);

      if (visualSample) {
        await page.screenshot({ path: testInfo.outputPath(`after-${slug}-${preference}-${testInfo.project.name}.png`), fullPage: true, animations: 'disabled' });
        await expect(family).toHaveScreenshot(`${slug}-${preference}.png`, { animations: 'disabled', maxDiffPixelRatio: 0.005 });
      }
      if (preference === 'system') {
        await page.emulateMedia({ colorScheme: 'light' });
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await page.reload({ waitUntil: 'networkidle' });
        await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'system');
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await page.emulateMedia({ colorScheme: 'dark' });
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
    });
  }
}
