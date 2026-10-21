import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAGE_CONTEXT } from '../lib/content/page-context';
import { INDEXABLE_ROUTES, ROUTE_POLICY } from '../lib/content/public-architecture';

const webRoot = resolve(import.meta.dirname, '..');

describe('public page explanations', () => {
  it('covers every indexable editorial route without replacing legal authority', () => {
    for (const route of INDEXABLE_ROUTES) {
      if (route === '/accessibility') continue;
      expect(PAGE_CONTEXT).toHaveProperty(route);
    }
  });

  it('connects each explanation to a real route with a route-owned rendering', () => {
    for (const [route, content] of Object.entries(PAGE_CONTEXT)) {
      const source = readFileSync(resolve(webRoot, `app/${route.slice(1)}/page.tsx`), 'utf8');
      expect(source).toContain(`<PageContext route="${route}" />`);
      expect(content.title.trim()).not.toBe('');
      expect(content.introduction.trim()).not.toBe('');
      expect(ROUTE_POLICY[route]).not.toBe('legacy-redirect');
      expect(ROUTE_POLICY[route]).not.toBe('authentication-system');
    }
  });

  it('links only to real canonical pages or approved infrastructure hosts', () => {
    for (const content of Object.values(PAGE_CONTEXT)) {
      for (const link of content.links) {
        expect(link.label.trim()).not.toBe('');
        if (link.href.startsWith('/')) {
          expect(existsSync(resolve(webRoot, `app/${link.href.slice(1)}/page.tsx`))).toBe(true);
          expect(ROUTE_POLICY[link.href]).not.toBe('legacy-redirect');
        } else {
          const url = new URL(link.href);
          expect(url.protocol).toBe('https:');
          expect(['docs.neptlium.com', 'status.neptlium.com']).toContain(url.hostname);
        }
      }
    }
  });

  it('keeps questions distinct and avoids placeholder or invented commercial proof', () => {
    for (const content of Object.values(PAGE_CONTEXT)) {
      expect(new Set(content.questions.map((entry) => entry.question)).size).toBe(content.questions.length);
      expect(new Set(content.sections.map((entry) => entry.title)).size).toBe(content.sections.length);
      const copy = JSON.stringify(content);
      expect(copy).not.toMatch(/lorem ipsum|\bTODO\b|\bTBD\b|coming soon|guaranteed returns|trusted by \d|SOC\s*2 certified/i);
    }
  });
});
