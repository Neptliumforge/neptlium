import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;

/**
 * `docs/experience/DESIGN_SYSTEM.md` §8 prohibits "page-local colour aliases (the retired
 * `--npt-*` set), raw hex section palettes and new global override layers", and
 * `apps/web/AGENTS.md` repeats it: "raw page-local brand palettes are prohibited".
 *
 * Nothing enforced that, which is how `/security` and `/insights` kept forced light palettes
 * (`.page{background:#fff}`) that ignored `html[data-theme]` and rendered a light page inside a
 * Dark site. This contract keeps route CSS on canonical tokens.
 *
 * Every entry below is a KNOWN, DOCUMENTED exception, not a licence to add more.
 */
const allowed = new Map([
  [
    'components/business-product-pages.module.css',
    'DESIGN_SYSTEM.md §8 marks this TRANSITION: Treasury and Payments keep a local forced-band palette until it converges onto canonical surfaces.',
  ],
  [
    'app/marketing-platform.module.css',
    'Unreferenced by any route or component; queued for removal in MARKETING_AUDIT_2026-10-22.md item 5.',
  ],
  [
    'app/personal/personal.module.css',
    'Unreachable behind the permanent /personal -> /capital redirect; queued for removal in MARKETING_AUDIT_2026-10-22.md item 5.',
  ],
]);

const rawColour = /#[0-9a-fA-F]{3,8}\b|rgba?\([0-9][^)]*\)|hsla?\([0-9][^)]*\)/;
const retiredAlias = /--npt-/;

function modules(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(root, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(root, rel)).isDirectory()) modules(rel, out);
    else if (entry.endsWith('.module.css')) out.push(rel);
  }
  return out;
}

const files = [...modules('app'), ...modules('components')].sort();

test('route CSS modules consume canonical tokens instead of raw colour literals', () => {
  assert.ok(files.length > 0, 'expected to discover CSS modules');
  const offenders = files.filter(
    (file) => !allowed.has(file) && rawColour.test(readFileSync(join(root, file), 'utf8')),
  );
  assert.deepEqual(
    offenders,
    [],
    `Raw colour literals are prohibited outside the documented exceptions. Map them onto canonical roles (--color-canvas, --color-surface-*, --color-text-*, --color-border-*, --color-accent-*) so Dark, Light and System render from the same rules. Offending: ${offenders.join(', ')}`,
  );
});

test('route CSS modules do not consume the retired --npt-* alias layer', () => {
  const offenders = files.filter(
    (file) => !allowed.has(file) && retiredAlias.test(readFileSync(join(root, file), 'utf8')),
  );
  assert.deepEqual(offenders, [], `The retired --npt-* aliases resolve to nothing. Offending: ${offenders.join(', ')}`);
});

test('every documented palette exception still exists and still needs the exception', () => {
  for (const [file, reason] of allowed) {
    assert.ok(reason.length > 40, `${file} needs a substantive reason`);
    const source = readFileSync(join(root, file), 'utf8');
    assert.ok(
      rawColour.test(source) || retiredAlias.test(source),
      `${file} no longer contains raw colour literals or retired aliases — remove it from the allowlist so the contract keeps its force.`,
    );
  }
});

test('the Security and Insights surfaces render from the canonical theme', () => {
  for (const file of ['app/security/security.module.css', 'app/insights/insights.module.css']) {
    const source = readFileSync(join(root, file), 'utf8');
    assert.doesNotMatch(source, rawColour, `${file} must not reintroduce a raw palette`);
    assert.match(source, /background:\s*var\(--color-canvas\)/, `${file} must take its page background from the canonical canvas`);
    assert.match(source, /color:\s*var\(--color-text-primary\)/, `${file} must take its primary ink from the canonical token`);
    assert.doesNotMatch(source, /background:\s*#fff/i, `${file} must not force a light page background`);
  }
});
