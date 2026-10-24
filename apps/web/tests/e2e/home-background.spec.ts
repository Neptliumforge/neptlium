import { expect, test } from '@playwright/test';

test('homepage background plays, pauses, and suspends outside the viewport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const video = page.locator('video');
  await expect(video).toHaveJSProperty('videoWidth', 1920);
  await expect(video).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Pause background motion' }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Play background motion' }).click();
  await expect(video).toHaveJSProperty('paused', false);
  await page
    .getByRole('heading', { name: 'Confidence begins with understanding.' })
    .scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('paused', true);
  await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('paused', false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('reduced motion keeps the poster without downloading the video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const videoRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/motion/tidal-arc.mp4')) videoRequests.push(request.url());
  });
  await page.goto('/');
  const video = page.locator('video');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(video).toBeHidden();
  await expect(video).not.toHaveAttribute('src');
  await expect(page.getByRole('button', { name: 'Pause background motion' })).toBeHidden();
  expect(videoRequests).toEqual([]);
});
