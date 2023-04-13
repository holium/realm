import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { StepProps } from './types';
import { InstallationDialog } from '../../../../../shared/src/onboarding/dialogs/InstallationDialog';

export const InstallationStep = ({ setStep }: StepProps) => {
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
    // Log in / go to home.
  };

  return (
    <InstallationDialog
      onInstallRealm={onInstallRealm}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
