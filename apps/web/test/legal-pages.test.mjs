import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  LEGAL_CENTER_PATH,
  LEGAL_DOC_ORDER,
  PROVIDER_DISCLOSURES,
  listLegalDocs,
  pendingFacts,
} from '../lib/content/legal.ts';
import { INDEXABLE_ROUTES, ROUTE_POLICY } from '../lib/content/public-architecture.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const docs = listLegalDocs();
const drafts = docs.filter((doc) => doc.status === 'draft');
const footer = read('components/site-footer.tsx');

const REQUIRED = {
  '/terms': 'Terms of Service',
  '/privacy': 'Privacy Policy',
  '/risk-disclosure': 'Financial and Digital Asset Risk Disclosures',
  '/e-delivery': 'Electronic Communications and E-Delivery',
  '/cookie-policy': 'Cookie Policy',
  '/aml-kyc': 'AML/KYC Policy Summary',
  '/complaints': 'Complaints and Support',
};

const allText = (doc) =>
  [
    doc.title,
    doc.intro,
    ...doc.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.items ?? [])]),
  ].join('\n');

test('every required legal document exists with its owner-approved title', () => {
  for (const [path, title] of Object.entries(REQUIRED)) {
    const doc = docs.find((candidate) => candidate.path === path);
    assert.ok(doc, `missing legal document for ${path}`);
    assert.equal(doc.title, title);
    assert.ok(doc.sections.length >= 5, `${path} is not substantive`);
  }
  assert.equal(new Set(docs.map((doc) => doc.path)).size, docs.length);
  assert.deepEqual(docs.map((doc) => doc.slug), [...LEGAL_DOC_ORDER]);
});

test('each legal route renders its registry document through the shared component', () => {
  for (const doc of docs) {
    const file = `app${doc.path}/page.tsx`;
    assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `${file} missing (route would 404)`);
    const source = read(file);
    assert.match(source, new RegExp(`getLegalDoc\\('${doc.slug}'\\)`));
    assert.match(source, /<LegalDocument doc=\{doc\} \/>/);
    assert.match(source, /legalMetadata\(doc\)/);
  }
  const center = read('app/legal/page.tsx');
  assert.match(center, /<LegalCenter \/>/);
  assert.match(center, /index: false/);
});

test('route policy keeps drafts out of the sitemap and index', () => {
  for (const doc of drafts) {
    assert.equal(ROUTE_POLICY[doc.path], 'public-supporting-noindex', doc.path);
    assert.ok(!INDEXABLE_ROUTES.includes(doc.path), `${doc.path} is a draft but indexable`);
  }
  assert.equal(ROUTE_POLICY[LEGAL_CENTER_PATH], 'public-supporting-noindex');
});

test('footer links every legal document and the legal centre', () => {
  for (const doc of docs) assert.ok(footer.includes(`'${doc.path}'`), `footer missing ${doc.path}`);
  assert.ok(footer.includes(`'${LEGAL_CENTER_PATH}'`));
  assert.match(footer, /aria-label="Legal"/);
});

test('drafts carry version, revision date and no effective date', () => {
  for (const doc of drafts) {
    assert.match(doc.version, /draft/i, doc.slug);
    assert.match(doc.lastRevised, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(doc.effectiveDate, null, `${doc.slug} must not be effective before approval`);
  }
  assert.ok(drafts.length >= 7);
});

test('section anchors are unique and URL-safe within each document', () => {
  for (const doc of docs) {
    const ids = doc.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length, doc.slug);
    for (const id of ids) assert.match(id, /^[a-z][a-z0-9-]*$/);
    for (const section of doc.sections) {
      for (const slug of section.see ?? []) assert.ok(LEGAL_DOC_ORDER.includes(slug), `${doc.slug}#${section.id} links unknown ${slug}`);
    }
  }
});

test('unresolved legal facts are recorded rather than invented', () => {
  const pendingFor = (slug) => pendingFacts(docs.find((doc) => doc.slug === slug)).join('\n');
  assert.match(pendingFor('terms'), /Registered legal name/);
  assert.match(pendingFor('terms'), /Governing law/);
  assert.match(pendingFor('terms'), /Regulatory status/);
  assert.match(pendingFor('privacy'), /Data controller/);
  assert.match(pendingFor('complaints'), /Official complaints address/);
  assert.match(pendingFor('complaints'), /External escalation route/);
  assert.match(pendingFor('aml-kyc'), /AML registration/);
  for (const doc of drafts) assert.ok(pendingFacts(doc).length > 0, `${doc.slug} has no recorded open facts`);
});

test('legal text makes no unsupported licensing, banking, insurance or return claims', () => {
  const text = docs.map(allText).join('\n') + PROVIDER_DISCLOSURES.map((p) => p.description).join('\n');
  const forbidden = [
    /\b(?:is|are) (?:licensed|regulated|authori[sz]ed) (?:by|as|under)\b/i,
    /\bregistered with\b/i,
    /\b(?:FDIC|SIPC)[- ]insured\b/i,
    /\bis (?:a bank|insured)\b/i,
    /\bguaranteed? (?:return|yield|income|profit)/i,
    /\brisk-free\b/i,
    /\bbank-grade\b/i,
    /\blicence number\b|\blicense number\b|\bregistration number:\s*\w/i,
  ];
  for (const pattern of forbidden) assert.doesNotMatch(text, pattern);
  assert.match(text, /not a bank/);
  assert.match(text, /Nothing in Neptlium guarantees a return/);
});

test('provider descriptions are conditional and match provider doctrine', () => {
  const byName = Object.fromEntries(PROVIDER_DISCLOSURES.map((p) => [p.name, p]));
  for (const name of ['Supabase', 'Resend', 'Stripe', 'Mercury', 'Circle', 'Alchemy']) assert.ok(byName[name], name);
  assert.equal(byName.Resend.state, 'Not integrated');
  assert.equal(byName.Mercury.state, 'Not integrated');
  assert.match(byName.Stripe.description, /not used to fund Neptlium Capital accounts/);
  assert.match(byName.Circle.state, /availability not established/i);
  assert.match(byName.Circle.description, /not your Neptlium balance until it has been recorded and reconciled/);
  assert.match(byName.Alchemy.description, /does not by itself credit, settle or reconcile/);
  assert.match(byName.Supabase.description, /does not by itself give access to money movement/);

  const doctrine = read('../../docs/platform/PROVIDERS.md');
  assert.match(doctrine, /\| Resend \| Communication Infrastructure \| Unsupported; no current integration \|/);
  assert.match(doctrine, /\| Mercury \| Banking Infrastructure \| Unsupported; no current integration \|/);
  assert.match(doctrine, /\| Stripe \| .* not live Capital funding \|/);
});
