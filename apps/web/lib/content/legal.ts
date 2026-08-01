/**
 * Legal document registry.
 * These are STRUCTURED INFORMATIONAL DRAFTS only. They are marked noindex
 * in metadata and require qualified legal review before public production
 * use (see README continuation checklist). No regulatory, insurance or
 * compliance claims are made.
 */

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDoc = {
  slug: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  /** When true, render the "Draft for review" banner. */
  draft?: boolean;
};

const REVIEW_NOTE =
  'This document is a structured informational draft for a new project and is not a substitute for legal advice. It requires review by qualified counsel before public production use.';

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  privacy: {
    slug: 'privacy',
    draft: true,
    title: 'Privacy Policy',
    intro:
      'This draft describes how Neptlium intends to approach the collection, use and protection of information. It remains subject to legal review.',
    sections: [
      {
        heading: 'Information we may collect',
        paragraphs: [
          'Neptlium may collect information you provide directly, such as account details and messages you send to us, as well as limited technical information generated when you use the site.',
          'The specific categories of information collected will be documented here once product functionality and legal review are complete.',
        ],
      },
      {
        heading: 'How information may be used',
        paragraphs: [
          'Information is intended to be used to operate, secure and improve Neptlium, to communicate with you, and to meet applicable obligations.',
          'Neptlium does not sell personal information.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You will be able to make choices about your information, including access and deletion requests where applicable. Details will be finalized following legal review.',
        ],
      },
      { heading: 'Review status', paragraphs: [REVIEW_NOTE] },
    ],
  },
  terms: {
    slug: 'terms',
    draft: true,
    title: 'Terms of Service',
    intro:
      'This draft outlines the intended terms governing use of the Neptlium website. It remains subject to legal review.',
    sections: [
      {
        heading: 'Use of the site',
        paragraphs: [
          'The Neptlium marketing website is provided for informational purposes. Content may change and does not constitute an offer, solicitation or investment advice.',
        ],
      },
      {
        heading: 'No investment advice',
        paragraphs: [
          'Nothing on this site is investment, legal or tax advice. Investing involves risk, including possible loss of principal.',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'The Neptlium name and site content are intended to be protected by applicable intellectual property rights.',
        ],
      },
      { heading: 'Review status', paragraphs: [REVIEW_NOTE] },
    ],
  },
  'risk-disclosure': {
    slug: 'risk-disclosure',
    draft: true,
    title: 'Risk Disclosure',
    intro:
      'This draft summarizes key risk concepts relevant to capital and investing. It remains subject to legal review.',
    sections: [
      {
        heading: 'Risk of loss',
        paragraphs: [
          'Investing involves risk, including the possible loss of principal. Past performance is not indicative of future results.',
        ],
      },
      {
        heading: 'Availability and eligibility',
        paragraphs: [
          'Neptlium does not represent any investment as available. Digital assets carry significant risk, including possible loss of principal.',
        ],
      },
      {
        heading: 'Informational purpose',
        paragraphs: [
          'Information presented by Neptlium is for informational purposes and does not constitute investment advice.',
        ],
      },
      { heading: 'Review status', paragraphs: [REVIEW_NOTE] },
    ],
  },
  'cookie-policy': {
    slug: 'cookie-policy',
    draft: true,
    title: 'Cookie Policy',
    intro:
      'This draft describes how Neptlium intends to use cookies and similar technologies. It remains subject to legal review.',
    sections: [
      {
        heading: 'What cookies are',
        paragraphs: [
          'Cookies are small files stored on your device that help websites function and remember preferences.',
        ],
      },
      {
        heading: 'How we may use them',
        paragraphs: [
          'Neptlium intends to use only the cookies necessary to operate and secure the site, plus any optional analytics that will be documented and consented to where required.',
        ],
      },
      { heading: 'Review status', paragraphs: [REVIEW_NOTE] },
    ],
  },
  accessibility: {
    slug: 'accessibility',
    title: 'Accessibility Statement',
    intro:
      'Neptlium is committed to building an accessible experience. This statement describes our intended approach and how to reach us.',
    sections: [
      {
        heading: 'Our commitment',
        paragraphs: [
          'We aim to meet WCAG 2.2 AA guidance across the Neptlium website, including keyboard support, sufficient contrast, semantic structure and reduced-motion support.',
        ],
      },
      {
        heading: 'Ongoing work',
        paragraphs: [
          'Accessibility is an ongoing effort. As the platform grows, we will continue to test and improve the experience.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'If you encounter an accessibility barrier, please email support@neptlium.com so we can address it.',
        ],
      },
    ],
  },
};

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS[slug];
}
