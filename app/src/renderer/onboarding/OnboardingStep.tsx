import { useState } from 'react';
import { observer } from 'mobx-react';

import { OnboardingStorage, RealmOnboardingStep } from '@holium/shared';

import { BootingStep, ChooseIdStep, LoginStep, PaymentStep } from './steps';
import { AddServerStep } from './steps/AddServerStep';
import { CredentialsStep } from './steps/CredentialsStep';
import { HostingStep } from './steps/HostingStep';
import { InstallationStep } from './steps/InstallationStep';
import { PassportStep } from './steps/PassportStep';
import { PasswordStep } from './steps/PasswordStep';

export type OnboardingStepProps = {
  initialStep: RealmOnboardingStep;
  onFinish: () => void;
};

export const OnboardingStepPresenter = ({
  initialStep,
  onFinish,
}: OnboardingStepProps) => {
  const [step, setStep] = useState(initialStep);

  const handleSetStep = (step: RealmOnboardingStep) => {
    setStep(step);
    // Persist step in local storage so the user can resume onboarding
    // even if they close the app.
    OnboardingStorage.set({ step });
  };

  switch (step) {
    case '/login':
      return <LoginStep setStep={handleSetStep} onFinish={onFinish} />;
    case '/hosting':
      return <HostingStep setStep={handleSetStep} onFinish={onFinish} />;
    case '/add-server':
      return <AddServerStep setStep={handleSetStep} />;
    case '/passport':
      return <PassportStep setStep={handleSetStep} onFinish={onFinish} />;
    case '/password':
      return <PasswordStep setStep={handleSetStep} />;
    case '/installation':
      return <InstallationStep setStep={handleSetStep} onFinish={onFinish} />;
    case '/choose-id':
      return <ChooseIdStep setStep={handleSetStep} />;
    case '/payment':
      return <PaymentStep setStep={handleSetStep} />;
    case '/booting':
      return <BootingStep setStep={handleSetStep} />;
    case '/credentials':
      return <CredentialsStep setStep={handleSetStep} />;
    default:
      return <LoginStep setStep={handleSetStep} />;
  }
};

export const OnboardingStep = observer(OnboardingStepPresenter);
