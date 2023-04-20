import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { InstallationDialog } from '@holium/shared';
import { StepProps } from './types';

type Props = {
  onFinish?: () => void;
} & StepProps;

export const InstallationStep = ({ setStep, onFinish }: Props) => {
  useEffect(() => {
    track('Onboarding / Installation');
  });

  const onBack = () => {
    setStep('/login');
  };

  const onInstallRealm = () => {
    return Promise.resolve(true);
  };

  const onNext = () => {
    onFinish?.();
    return Promise.resolve(true);
  };

  return (
    <InstallationDialog
      onInstallRealm={onInstallRealm}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
