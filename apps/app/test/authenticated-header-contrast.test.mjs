import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const tokens = read('../../../packages/ui/src/styles/tokens.css');
const product = read('../app/authenticated-product.css');
const mobile = read('../app/authenticated-mobile.css');
const shell = read('../../../packages/ui/src/shell/AppShell.tsx');

function declarations(source) {
  return Object.fromEntries(
    [...source.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]),
  );
}

function themeColors(theme) {
  const colors = declarations(tokens.match(/@theme\s*\{([\s\S]*?)\n\}/)[1]);
  if (theme === 'light') {
    for (const match of tokens.matchAll(/html\[data-theme='light'\]\s*\{([^}]+)\}/g)) {
      Object.assign(colors, declarations(match[1]));
    }
  }
  const resolve = (value) => value.replace(/var\((--[\w-]+)\)/g, (_, key) => resolve(colors[key]));
  return (role) => resolve(colors[role]);
}

function luminance(color, canvas) {
  const hexChannels = (hex) =>
    [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  const translucent = color.match(/^rgb\((\d+) (\d+) (\d+) \/ (\d+)%\)$/);
  const channels = translucent
    ? hexChannels(canvas).map((channel, index) => {
        const alpha = Number(translucent[4]) / 100;
        return Number(translucent[index + 1]) * alpha + channel * (1 - alpha);
      })
    : hexChannels(color);
  assert.ok(
    translucent || /^#[\da-f]{6}$/i.test(color),
    'Expected canonical hex or translucent RGB color',
  );
  const linear = channels.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

for (const theme of ['dark', 'light']) {
  test(`${theme} authenticated desktop and mobile header text meets AA contrast`, () => {
    const color = themeColors(theme);
    assert.match(shell, /<header className="[^"\n]*bg-topnav/);
    const backgrounds = [
      product.match(
        /\.neptlium-environment\s*>\s*div\s*>\s*header\s*\{[^}]*background:\s*var\((--[\w-]+)\)/,
      )?.[1] ?? '--color-topnav',
      mobile.match(/\.product-mobile-header\s*\{[^}]*background:\s*var\((--[\w-]+)\)/)?.[1],
    ];
    for (const background of backgrounds) {
      assert.ok(background, 'Authenticated headers need an explicit theme-responsive background');
      for (const role of ['--color-text-primary', '--color-text-secondary', '--color-text-muted']) {
        const a = luminance(color(role), color('--color-canvas'));
        const b = luminance(color(background), color('--color-canvas'));
        const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        assert.ok(
          ratio >= 4.5,
          `${theme} ${role} contrast ${ratio.toFixed(2)} is below 4.5:1`,
        );
      }
    }
  });
}
