import { observer } from 'mobx-react';

import { OnboardingStorage } from '@holium/shared';

import { useAppState } from 'renderer/stores/app.store';

import { BootingStep, ChooseIdStep, LoginStep, PaymentStep } from './steps';
import { AddServerStep } from './steps/AddServerStep';
import { CredentialsStep } from './steps/CredentialsStep';
import { HostingStep } from './steps/HostingStep';
import { InstallationStep } from './steps/InstallationStep';
import { PassportStep } from './steps/PassportStep';

export const OnboardingStepPresenter = () => {
  const { onboardingStep, setCurrentScreen, setOnboardingStep } = useAppState();

  const finishOnboarding = () => {
    setCurrentScreen('login');
    OnboardingStorage.reset();
  };

  switch (onboardingStep) {
    case '/login':
      return (
        <LoginStep
          setStep={setOnboardingStep}
          finishOnboarding={finishOnboarding}
        />
      );
    case '/intermediary-login':
      return (
        <LoginStep forcedNextStep="/choose-id" setStep={setOnboardingStep} />
      );
    case '/hosting':
      return (
        <HostingStep
          setStep={setOnboardingStep}
          finishOnboarding={finishOnboarding}
        />
      );
    case '/add-server':
      return <AddServerStep setStep={setOnboardingStep} />;
    case '/passport':
      return (
        <PassportStep
          setStep={setOnboardingStep}
          finishOnboarding={finishOnboarding}
        />
      );
    case '/installation':
      return (
        <InstallationStep
          setStep={setOnboardingStep}
          finishOnboarding={finishOnboarding}
        />
      );
    case '/choose-id':
      return <ChooseIdStep setStep={setOnboardingStep} />;
    case '/payment':
      return <PaymentStep setStep={setOnboardingStep} />;
    case '/booting':
      return <BootingStep setStep={setOnboardingStep} />;
    case '/credentials':
      return <CredentialsStep setStep={setOnboardingStep} />;
    default:
      return <LoginStep setStep={setOnboardingStep} />;
  }
};

export const OnboardingStep = observer(OnboardingStepPresenter);
