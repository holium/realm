import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { StepProps } from './types';
import { InstallationDialog } from '../../../../../shared/src/onboarding/dialogs/InstallationDialog';

type Props = {
  onNext: () => Promise<boolean>;
} & StepProps;

export const InstallationStep = ({ setStep, onNext }: Props) => {
  useEffect(() => {
    track('Onboarding / Installation');
  });

  const onBack = () => {
    setStep('/login');
  };

  const onInstallRealm = () => {
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
