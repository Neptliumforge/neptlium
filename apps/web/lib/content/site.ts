export const SITE = {
  name: 'Neptlium',
  url: 'https://neptlium.com',
  domain: 'neptlium.com',
  positioning: 'Capital operating infrastructure for modern ownership.',
  description:
    'Neptlium brings portfolio intelligence, capital organization, allocation modeling, treasury visibility and modern ownership infrastructure into one governed environment.',
  supportEmail: 'support@neptlium.com',
  accessUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.neptlium.com',
  signInUrl: process.env.NEXT_PUBLIC_SIGN_IN_URL ?? 'https://app.neptlium.com/auth/sign-in',
  copyright: '© 2026 Neptlium. All rights reserved.',
} as const;
export const DISCLOSURES = {
  general:
    'Information presented by Neptlium is for informational purposes and does not constitute investment advice.',
  investment:
    'Digital assets involve significant risk, including possible loss of principal. Availability depends on verified infrastructure and providers.',
  modeling: 'Illustrative. Modeling does not move capital.',
} as const;
