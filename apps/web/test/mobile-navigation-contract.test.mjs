import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const header = readFileSync(new URL('../components/site-header.tsx', import.meta.url), 'utf8');
const mobile = readFileSync(
  new URL('../components/mobile-navigation.tsx', import.meta.url),
  'utf8',
);
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('mobile navigation is portaled outside the header stacking context', () => {
  assert.match(header, /import \{ createPortal \} from 'react-dom'/);
  assert.match(
    header,
    /mounted && mobileOpen[\s\S]*createPortal\([\s\S]*<MobileNavigation[\s\S]*document\.body/,
  );
  assert.match(mobile, /role="dialog"/);
  assert.match(mobile, /aria-modal="true"/);
  assert.match(mobile, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(mobile, /triggerRef\.current\?\.focus\(\)/);
});

test('mobile navigation owns an opaque editorial viewport', () => {
  assert.doesNotMatch(layout, /mobile-navigation-fix\.css/);
  assert.match(css, /\.mobile-command-wrap/);
  assert.match(css, /\.mobile-command-nav/);
});

test('mobile menu exposes canonical product-family navigation and separate account actions', () => {
  assert.match(mobile, /NAVIGATION\.map/);
  assert.match(mobile, /className="mobile-nav-grid"/);
  assert.match(mobile, /href=\{SITE\.personalSignInUrl\}>Sign in/);
  assert.match(mobile, /href=\{SITE\.personalSignUpUrl\}>Open account/);
  assert.match(mobile, /href=\{SITE\.businessAppUrl\}>Open Neptlium Treasury/);
  assert.match(mobile, /Treasury access/);
  assert.match(mobile, /Socials/);
  assert.doesNotMatch(mobile, /aria-expanded/);
});

test('mobile navigation preserves visible acquisition and 44px top-level targets', () => {
  assert.match(
    css,
    /\.mobile-command-sheet \.mobile-section-label\s*\{[^}]*min-height: 2\.75rem !important;/s,
  );
  assert.match(
    css,
    /\.mobile-command-sheet \.mobile-enter-action\s*\{[^}]*min-height: 3\.5rem !important;/s,
  );
  assert.match(
    css,
    /\.mobile-command-sheet \.mobile-enter-action\s*\{[^}]*background: #0a746c !important;/s,
  );
  assert.match(
    css,
    /\.mobile-command-sheet \.mobile-enter-action\s*\{[^}]*color: #fff !important;/s,
  );
});
