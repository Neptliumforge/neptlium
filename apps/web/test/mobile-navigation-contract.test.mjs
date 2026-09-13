import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const header = readFileSync(new URL('../components/site-header.tsx', import.meta.url), 'utf8');
const mobile = readFileSync(new URL('../components/mobile-navigation.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/mobile-navigation-fix.css', import.meta.url), 'utf8');

test('mobile navigation is portaled outside the header stacking context', () => {
  assert.match(header, /import \{ createPortal \} from 'react-dom'/);
  assert.match(header, /mounted && mobileNavigation \? createPortal\(mobileNavigation, document\.body\)/);
  assert.match(mobile, /role="dialog"/);
  assert.match(mobile, /aria-modal="true"/);
  assert.match(mobile, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(mobile, /triggerRef\.current\?\.focus\(\)/);
});

test('mobile navigation owns an opaque editorial viewport', () => {
  assert.match(layout, /import '\.\/mobile-navigation-fix\.css'/);
  assert.match(css, /\.mobile-command-wrap\s*\{[^}]*position: fixed;/s);
  assert.match(css, /\.mobile-command-wrap\s*\{[^}]*height: 100dvh;/s);
  assert.match(css, /\.mobile-command-wrap\s*\{[^}]*background: #fbfaf7;/s);
  assert.match(css, /\.mobile-command-nav\s*\{[^}]*overflow-y: auto;/s);
});

test('mobile menu exposes canonical investor navigation and separate account actions', () => {
  assert.match(mobile, /NAVIGATION\.map/);
  assert.match(mobile, /className="mobile-nav-grid"/);
  assert.match(mobile, /href=\{SITE\.signInUrl\}>Sign In/);
  assert.match(mobile, /href=\{SITE\.signUpUrl\}>Get Started/);
  assert.match(mobile, /Socials/);
  assert.doesNotMatch(mobile, /aria-expanded/);
});

test('mobile navigation preserves visible acquisition and 44px top-level targets', () => {
  assert.match(css, /\.mobile-command-sheet \.mobile-section-label\s*\{[^}]*min-height: 2\.75rem !important;/s);
  assert.match(css, /\.mobile-command-sheet \.mobile-enter-action\s*\{[^}]*min-height: 3\.5rem !important;/s);
  assert.match(css, /\.mobile-command-sheet \.mobile-enter-action\s*\{[^}]*background: #0a746c !important;/s);
  assert.match(css, /\.mobile-command-sheet \.mobile-enter-action\s*\{[^}]*color: #fff !important;/s);
});
