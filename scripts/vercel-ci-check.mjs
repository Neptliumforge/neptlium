import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const products = ['api', 'app', 'admin', 'treasury', 'pay', 'status', 'docs', 'web'];

for (const product of products) {
  test(`Vercel Git-linked ${product} surface has an explicit build contract`, () => {
    const directory = resolve(root, 'apps', product);
    const file = resolve(directory, 'package.json');
    assert.ok(existsSync(file), `Missing app: ${product}`);
    const pkg = JSON.parse(readFileSync(file, 'utf8'));
    assert.equal(pkg.name, `@neptlium/${product}`);
    assert.equal(typeof pkg.scripts?.build, 'string', `Missing build script for ${product}`);
    assert.equal(typeof pkg.scripts?.typecheck, 'string', `Missing typecheck for ${product}`);
    assert.equal(typeof pkg.scripts?.lint, 'string', `Missing lint for ${product}`);
    assert.doesNotMatch(pkg.scripts.build, /\b(vercel deploy|vercel promote|vercel --prod)\b/, 'Build scripts must not deploy');
    const config = resolve(directory, 'vercel.json');
    if (existsSync(config)) JSON.parse(readFileSync(config, 'utf8'));
  });
}

test('workspace uses a pinned package manager for reproducible CI', () => {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  assert.match(pkg.packageManager, /^pnpm@\d+\.\d+\.\d+$/);
  assert.ok(existsSync(resolve(root, 'pnpm-lock.yaml')));
});
