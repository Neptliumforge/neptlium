import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LegalCenter, LegalDocument } from '../components/legal-document';
import { getLegalDoc, listLegalDocs, pendingFacts } from '../lib/content/legal';
import { legalMetadata } from '../lib/seo';

const render = (doc: ReturnType<typeof getLegalDoc>) =>
  renderToStaticMarkup(createElement(LegalDocument, { doc }));

describe('legal document rendering', () => {
  it.each(listLegalDocs().map((doc) => [doc.path, doc] as const))('%s renders a complete document', (_path, doc) => {
    const html = render(doc);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(`>${doc.title.replace('&', '&amp;')}</h1>`);
    expect(html).toContain('aria-label="Document status"');
    expect(html).toContain(doc.version);
    expect(html).toContain(`dateTime="${doc.lastRevised}"`);
    expect(html).toContain('aria-label="On this page"');
    expect(html).toContain('aria-label="Other legal documents"');
    for (const section of doc.sections) {
      expect(html).toContain(`id="${section.id}"`);
      expect(html).toContain(`href="#${section.id}"`);
    }
    expect(html).toContain('href="/legal"');
  });

  it('drafts show the review banner, no effective date and every open fact', () => {
    const doc = getLegalDoc('terms');
    const html = render(doc);
    expect(html).toContain('Draft for review.');
    expect(html).toContain('Draft — pending legal review');
    expect(html).toContain('Not yet in effect');
    expect(html).toContain('id="pending-confirmation"');
    for (const fact of pendingFacts(doc)) expect(html).toContain(fact.replace(/'/g, '&#x27;'));
  });

  it('the accessibility statement is not presented as a draft', () => {
    const html = render(getLegalDoc('accessibility'));
    expect(html).not.toContain('Draft for review.');
    expect(html).not.toContain('pending-confirmation');
  });

  it('the privacy policy renders the provider table with conditional states', () => {
    const html = render(getLegalDoc('privacy'));
    for (const name of ['Supabase', 'Vercel', 'Stripe', 'Circle', 'Alchemy', 'Resend', 'Mercury']) {
      expect(html).toContain(`<h3>${name}</h3>`);
    }
    expect(html.match(/Not integrated/g)?.length).toBe(2);
  });

  it('cross-document links resolve to registry routes', () => {
    const paths = new Set(listLegalDocs().map((doc) => doc.path));
    for (const doc of listLegalDocs()) {
      const html = render(doc);
      for (const [, href] of html.matchAll(/href="(\/[^"#]*)"/g)) {
        if (href === '/' || href === '/legal') continue;
        expect(paths.has(href as `/${string}`)).toBe(true);
      }
    }
  });

  it('the legal centre lists every document with its status', () => {
    const html = renderToStaticMarkup(createElement(LegalCenter));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    for (const doc of listLegalDocs()) expect(html).toContain(`href="${doc.path}"`);
    expect(html).toContain('Review status.');
  });
});

describe('legal metadata', () => {
  it('keeps drafts out of search indexes and indexes current documents', () => {
    for (const doc of listLegalDocs()) {
      const metadata = legalMetadata(doc);
      const indexable = doc.status !== 'draft';
      expect(metadata.robots).toEqual({ index: indexable, follow: indexable });
      expect(metadata.alternates?.canonical).toBe(doc.path);
    }
  });
});
