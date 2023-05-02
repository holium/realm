import { RealmOnboardingStep } from '@holium/shared';

export type StepProps = {
  forcedNextStep?: RealmOnboardingStep;
  setStep: (step: RealmOnboardingStep) => void;
  onFinish?: () => void;
};
