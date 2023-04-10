import { onboardingPages } from '@holium/shared';
import { types, Instance } from 'mobx-state-tree';

const OnboardingStep = types.enumeration('OnboardingStep', onboardingPages);

export type OnboardingStepType = Instance<typeof OnboardingStep>;

export const OnboardingModel = types
  .model('Onboarding', {
    step: OnboardingStep,
  })
  .views((self) => ({
    get currentStep() {
      return self.step;
    },
  }))
  .actions((self) => ({
    setStep(step: OnboardingStepType) {
      self.step = step;
    },
  }));

export type OnboardingModelType = Instance<typeof OnboardingModel>;
