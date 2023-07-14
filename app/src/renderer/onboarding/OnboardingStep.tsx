import { observer } from 'mobx-react';

import { useAppState } from 'renderer/stores/app.store';

import { AddIdentityStep } from './steps/AddIdentityStep';
import { HostingStep } from './steps/HostingStep';
import { InstallationStep } from './steps/InstallationStep';
import { LoginStep } from './steps/LoginStep';
import { PassportStep } from './steps/PassportStep';

export const OnboardingStepPresenter = () => {
  const { onboardingStep, setOnboardingStep } = useAppState();

  switch (onboardingStep) {
    case '/login':
      return <LoginStep setStep={setOnboardingStep} />;
    case '/intermediary-login':
      return (
        <LoginStep forcedNextStep="/choose-id" setStep={setOnboardingStep} />
      );
    case '/hosting':
      return <HostingStep setStep={setOnboardingStep} />;
    case '/add-identity':
      return <AddIdentityStep setStep={setOnboardingStep} />;
    case '/passport':
      return <PassportStep setStep={setOnboardingStep} />;
    case '/installation':
      return <InstallationStep setStep={setOnboardingStep} />;
    default:
      return <LoginStep setStep={setOnboardingStep} />;
  }
};

export const OnboardingStep = observer(OnboardingStepPresenter);
