import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../..');

async function source(relativePath) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

test('shared ThemeProvider owns persistence, system resolution, and live system changes', async () => {
  const provider = await source('packages/ui/src/providers/ThemeProvider.tsx');

  assert.match(provider, /export type ThemePreference = 'light' \| 'dark' \| 'system'/);
  assert.match(provider, /const STORAGE_KEY = 'neptlium-theme'/);
  assert.match(provider, /matchMedia\('\(prefers-color-scheme: dark\)'\)/);
  assert.match(provider, /media\.addEventListener\('change', onSystemChange\)/);
  assert.match(provider, /localStorage\.setItem\(STORAGE_KEY, value\)/);
  assert.match(provider, /stored === 'light' \|\| stored === 'dark' \|\| stored === 'system' \? stored : 'system'/);
});

test('Web, App, and Treasury consume the shared boot and provider authority', async () => {
  for (const relativePath of [
    'apps/web/app/layout.tsx',
    'apps/app/app/layout.tsx',
    'apps/treasury/app/layout.tsx',
  ]) {
    const layout = await source(relativePath);
    assert.match(layout, /ThemeProvider, themeBootScript/);
    assert.match(layout, /<ThemeProvider>/);
    assert.match(layout, /__html: themeBootScript/);
    assert.doesNotMatch(layout, /const themeBoot =/);
    assert.doesNotMatch(layout, /localStorage\.getItem\('neptlium-theme'\)/);
  }
});

test('App theme control delegates preference state to shared authority', async () => {
  const switcher = await source('apps/app/components/navigation/ThemeSwitcher.tsx');

  assert.match(switcher, /useTheme/);
  assert.match(switcher, /preference, setPreference/);
  assert.match(switcher, /aria-pressed=\{preference === value\}/);
  assert.doesNotMatch(switcher, /localStorage/);
  assert.doesNotMatch(switcher, /matchMedia/);
  assert.doesNotMatch(switcher, /document\.documentElement/);
});

test('authenticated App no longer imposes a dark-only root color scheme', async () => {
  const globalCss = await source('apps/app/app/global.css');
  const layout = await source('apps/app/app/layout.tsx');

  assert.doesNotMatch(globalCss, /html\s*\{\s*color-scheme:\s*dark/);
  assert.match(layout, /colorScheme: 'light dark'/);
  assert.match(layout, /'#f4f5f2'/);
  assert.match(layout, /'#0b0c0e'/);
});
