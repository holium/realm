import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import {
  BootingStep,
  ChooseIdStep,
  CreateAccountStep,
  LoginStep,
  PaymentStep,
  VerifyEmailStep,
} from './steps';
import { CredentialsStep } from './steps/CredentialsStep';

export const OnboardingStepPresenter = () => {
  const { onboarding } = useServices();

  switch (onboarding.currentStep) {
    case '/':
      return <CreateAccountStep setStep={onboarding.setStep} />;
    case '/verify-email':
      return <VerifyEmailStep setStep={onboarding.setStep} />;
    case '/choose-id':
      return <ChooseIdStep setStep={onboarding.setStep} />;
    case '/payment':
      return <PaymentStep setStep={onboarding.setStep} />;
    case '/booting':
      return <BootingStep setStep={onboarding.setStep} />;
    case '/credentials':
      return <CredentialsStep setStep={onboarding.setStep} />;
    case '/login':
      return <LoginStep setStep={onboarding.setStep} />;
    default:
      return <LoginStep setStep={onboarding.setStep} />;
  }
};

export const OnboardingStep = observer(OnboardingStepPresenter);
