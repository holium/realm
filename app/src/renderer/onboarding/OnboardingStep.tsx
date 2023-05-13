import { observer } from 'mobx-react';

import { useAppState } from 'renderer/stores/app.store';

import { AddServerStep } from './steps/AddServerStep';
import { BootingStep } from './steps/BootingStep';
import { ChooseIdStep } from './steps/ChooseIdStep';
import { CredentialsStep } from './steps/CredentialsStep';
import { HostingStep } from './steps/HostingStep';
import { InstallationStep } from './steps/InstallationStep';
import { LoginStep } from './steps/LoginStep';
import { PassportStep } from './steps/PassportStep';
import { PaymentStep } from './steps/PaymentStep';

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
    case '/add-server':
      return <AddServerStep setStep={setOnboardingStep} />;
    case '/passport':
      return <PassportStep setStep={setOnboardingStep} />;
    case '/installation':
      return <InstallationStep setStep={setOnboardingStep} />;
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
