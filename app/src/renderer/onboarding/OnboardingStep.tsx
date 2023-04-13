import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BootingStep, ChooseIdStep, LoginStep, PaymentStep } from './steps';
import { CredentialsStep } from './steps/CredentialsStep';
import { HostingStep } from './steps/HostingStep';

export const OnboardingStepPresenter = () => {
  const { onboarding } = useServices();

  switch (onboarding.currentStep) {
    case '/login':
      return <LoginStep setStep={onboarding.setStep} />;
    case '/add-ship':
    case '/passport':
    case '/installation':
    case '/hosting':
      return <HostingStep setStep={onboarding.setStep} />;
    case '/choose-id':
      return <ChooseIdStep setStep={onboarding.setStep} />;
    case '/payment':
      return <PaymentStep setStep={onboarding.setStep} />;
    case '/booting':
      return <BootingStep setStep={onboarding.setStep} />;
    case '/credentials':
      return <CredentialsStep setStep={onboarding.setStep} />;
    default:
      return <LoginStep setStep={onboarding.setStep} />;
  }
};

export const OnboardingStep = observer(OnboardingStepPresenter);
