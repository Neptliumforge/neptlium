import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const legacyWorkspace = ['va', 'ult'].join('');
const legacyProduct = ['Vault', 'Rail'].join('');
const forbidden = [legacyWorkspace, legacyProduct];

const requiredPaths = [
  'apps/app',
  'apps/treasury',
  'apps/pay',
  'apps/docs',
  'apps/status',
  'packages/types/src/product-family.ts',
  'docs/00_PRODUCT_HIERARCHY.md',
];

for (const path of requiredPaths) {
  if (!existsSync(path)) throw new Error(`Missing required Neptlium product hierarchy path: ${path}`);
}

if (existsSync(`apps/${legacyWorkspace}`)) {
  throw new Error('Legacy business workspace must not exist.');
}

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const violations = [];
for (const path of tracked) {
  let content;
  try {
    content = readFileSync(path, 'utf8');
  } catch {
    continue;
  }
  if (content.includes('\u0000')) continue;
  for (const token of forbidden) {
    if (content.toLowerCase().includes(token.toLowerCase())) violations.push(`${path}: ${token}`);
  }
}

if (violations.length) {
  throw new Error(`Legacy product naming remains in tracked files:\n${violations.join('\n')}`);
}

const family = readFileSync('packages/types/src/product-family.ts', 'utf8');
for (const contract of [
  'Neptlium Capital',
  'Neptlium Treasury',
  'Neptlium Institutional',
  'Neptlium Infrastructure',
  'treasury.neptlium.com',
]) {
  if (!family.includes(contract)) throw new Error(`Missing hierarchy contract: ${contract}`);
}

console.log('Neptlium product hierarchy validation passed.');
