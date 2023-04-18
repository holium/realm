import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { StepProps } from './types';
import { InstallationDialog } from '../../../../../shared/src/onboarding/dialogs/InstallationDialog';

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
