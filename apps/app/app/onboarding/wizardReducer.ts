import type { ProvisioningPayload } from "@neptlium/lib";
import { onboardingSteps } from "./wizard-steps";

export interface WizardState {
  readonly stepIndex: number;
  readonly data: Partial<ProvisioningPayload>;
}

export type WizardAction =
  | { readonly type: "NEXT"; readonly payload?: Partial<ProvisioningPayload> }
  | { readonly type: "BACK" };

export const initialWizardState: WizardState = {
  stepIndex: 0,
  data: {}
};

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT":
      return {
        stepIndex: Math.min(state.stepIndex + 1, onboardingSteps.length - 1),
        data: { ...state.data, ...action.payload }
      };
    case "BACK":
      return {
        ...state,
        stepIndex: Math.max(state.stepIndex - 1, 0)
      };
    default:
      return state;
  }
}
