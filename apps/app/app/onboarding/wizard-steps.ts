export const onboardingSteps = [
  { key: 'details', label: 'Your details' },
  { key: 'account-type', label: 'Account type' },
  { key: 'organization', label: 'Organization' },
  { key: 'review', label: 'Review' },
] as const;

export type OnboardingStepKey = (typeof onboardingSteps)[number]['key'];
