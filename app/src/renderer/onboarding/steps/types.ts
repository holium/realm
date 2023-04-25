import { RealmOnboardingStep } from '@holium/shared';

export type StepProps = {
  setStep: (step: RealmOnboardingStep) => void;
  onFinish?: () => void;
};
