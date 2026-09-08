import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/landing-v3.css', import.meta.url), 'utf8');

test('landing v3 keeps canonical first-view proposition and actions', () => {
  assert.match(page, /Capital operating infrastructure/);
  assert.match(page, /The operating system for capital\./);
  assert.match(page, /See capital clearly\. Coordinate what comes next\. Govern how it moves\./);
  assert.match(page, /SITE\.publicAccessLabel/);
  assert.match(page, /Explore the platform/);
});

test('landing v3 is image-independent and loaded after the canonical visual system', () => {
  assert.match(layout, /import '\.\/landing-v3\.css'/);
  assert.doesNotMatch(page, /<Image|<img|\.png|\.webp|\.jpe?g/i);
  assert.match(css, /CSS\/SVG only; no decorative image asset/);
  assert.match(css, /radial-gradient/);
  assert.match(css, /\.hero-wave-field/);
});

test('landing v3 preserves first-view CTA authority on mobile and short heights', () => {
  assert.match(css, /min-height:\s*100svh/);
  assert.match(css, /\.authority-actions \.web-button\.secondary/);
  assert.match(css, /width:\s*100%/);
  assert.match(css, /@media \(max-width: 430px\) and \(max-height: 740px\)/);
  assert.match(css, /\.authority-actions \.text-arrow-link\.on-dark/);
});

test('landing v3 compresses existing hero architecture into a restrained domain rail', () => {
  assert.match(css, /grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /text-transform:\s*uppercase/);
  assert.match(css, /hero-architecture-kicker[\s\S]*display:\s*none/);
});
