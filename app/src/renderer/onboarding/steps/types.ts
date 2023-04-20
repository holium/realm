import { OnboardingStepType } from 'renderer/stores/models/onboarding.model';

export type StepProps = {
  setStep: (step: OnboardingStepType) => void;
};
