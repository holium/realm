import { useState } from 'react';
import { observer } from 'mobx-react';
import { BootingStep, ChooseIdStep, LoginStep, PaymentStep } from './steps';
import { CredentialsStep } from './steps/CredentialsStep';
import { HostingStep } from './steps/HostingStep';
import { AddServerStep } from './steps/AddServerStep';
import { PassportStep } from './steps/PassportStep';
import { InstallationStep } from './steps/InstallationStep';

export type Step =
  | '/login'
  | '/add-server'
  | '/passport'
  | '/hosting'
  | '/choose-id'
  | '/payment'
  | '/booting'
  | '/credentials'
  | '/installation';

export type OnboardingStepProps = {
  initialStep?: Step;
  onFinish: () => void;
};

const defaultInitialStep =
  (localStorage.getItem('onboardingStep') as Step | undefined) ?? '/login';

export const OnboardingStepPresenter = ({
  initialStep = defaultInitialStep,
  onFinish,
}: OnboardingStepProps) => {
  const [step, setStep] = useState<Step>(initialStep);

  const handleSetStep = (step: Step) => {
    setStep(step);
    localStorage.setItem('onboardingStep', step);
  };

  const handleOnFinish = () => {
    localStorage.setItem('onboardingStep', '/login');
    onFinish?.();
  };

  switch (step) {
    case '/login':
      return <LoginStep setStep={handleSetStep} onFinish={onFinish} />;
    case '/hosting':
      return <HostingStep setStep={handleSetStep} onFinish={onFinish} />;
    case '/add-server':
      return <AddServerStep setStep={handleSetStep} />;
    case '/passport':
      return <PassportStep setStep={handleSetStep} onFinish={handleOnFinish} />;
    case '/installation':
      return (
        <InstallationStep setStep={handleSetStep} onFinish={handleOnFinish} />
      );
    case '/choose-id':
      return <ChooseIdStep setStep={handleSetStep} />;
    case '/payment':
      return <PaymentStep setStep={handleSetStep} />;
    case '/booting':
      return <BootingStep setStep={handleSetStep} />;
    case '/credentials':
      return <CredentialsStep setStep={handleSetStep} />;
    default:
      return <LoginStep setStep={handleSetStep} onFinish={onFinish} />;
  }
};

export const OnboardingStep = observer(OnboardingStepPresenter);
