import { onboardingPages } from '@holium/shared';
import { types, Instance } from 'mobx-state-tree';

const OnboardingStep = types.enumeration('OnboardingStep', onboardingPages);

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
    setStep(step: Instance<typeof OnboardingStep>) {
      self.step = step;
    },
  }));

export type OnboardingModelType = Instance<typeof OnboardingModel>;
