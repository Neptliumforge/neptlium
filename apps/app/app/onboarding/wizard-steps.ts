export const onboardingSteps = [
  { key: 'details', label: 'Your details' },
  { key: 'review', label: 'Review' },
] as const;

export type OnboardingStepKey = (typeof onboardingSteps)[number]['key'];
