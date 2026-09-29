import assert from 'node:assert/strict';
import test from 'node:test';
import { createPageMetadata } from '../lib/seo.ts';
import { cn } from '../lib/utils.ts';

test('public metadata uses canonical URL and consistent social metadata', () => {
  const metadata = createPageMetadata({ title: 'Capital', description: 'Capital overview', path: '/capital' });
  assert.deepEqual(metadata.alternates, { canonical: '/capital' });
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.equal(metadata.openGraph?.url, 'https://neptlium.com/capital');
  assert.equal(metadata.openGraph?.title, 'Capital');
  assert.equal(metadata.twitter?.title, 'Capital');
});

test('non-indexable public pages do not advertise indexing or following', () => {
  const metadata = createPageMetadata({ title: 'Private preview', description: 'Preview', path: '/preview', index: false });
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.deepEqual(metadata.alternates, { canonical: '/preview' });
});

test('shared class helper resolves conflicting Tailwind utilities', () => {
  assert.equal(cn('px-2', false, 'px-4', ['text-sm', 'text-lg']), 'px-4 text-lg');
});
