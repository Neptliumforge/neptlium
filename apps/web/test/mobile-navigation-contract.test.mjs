import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const header = readFileSync(new URL('../components/site-header.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/mobile-navigation-fix.css', import.meta.url), 'utf8');

test('mobile navigation is portaled outside the header stacking context', () => {
  assert.match(header, /import \{ createPortal \} from 'react-dom'/);
  assert.match(header, /mounted && mobileNavigation \? createPortal\(mobileNavigation, document\.body\)/);
  assert.match(header, /role="dialog"/);
  assert.match(header, /aria-modal="true"/);
  assert.match(header, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(header, /trigger\.current\?\.focus\(\)/);
});

test('mobile navigation owns an opaque viewport and stable action footer', () => {
  assert.match(layout, /import '\.\/mobile-navigation-fix\.css'/);
  assert.match(css, /\.mobile-command-wrap\s*\{[^}]*position: fixed;/s);
  assert.match(css, /\.mobile-command-wrap\s*\{[^}]*height: 100dvh;/s);
  assert.match(css, /\.mobile-command-wrap\s*\{[^}]*background: var\(--web-carbon\);/s);
  assert.match(css, /\.mobile-command-sheet\s*\{[^}]*grid-template-rows: auto minmax\(0, 1fr\) auto;/s);
  assert.match(css, /\.mobile-command-nav\s*\{[^}]*overflow-y: auto;/s);
  assert.match(css, /\.mobile-command-actions\s*\{[^}]*grid-template-columns: 1fr;/s);
  assert.match(css, /\.mobile-enter-action\s*\{[^}]*width: 100%;/s);
});

test('mobile menu preserves the canonical primary action and semantic disclosures', () => {
  assert.match(header, /SITE\.publicAccessLabel/);
  assert.match(header, /className=\{chrome\.mobileEntryAction\}/);
  assert.match(header, /aria-expanded=\{expanded\}/);
  assert.match(header, /aria-controls=\{controls\}/);
  assert.match(header, /Explore platform/);
});
