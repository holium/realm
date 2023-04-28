import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { InstallationDialog } from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { StepProps } from './types';

export const InstallationStep = ({ setStep, onFinish }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Installation');
  });

  const onBack = () => {
    setStep('/passport');
  };

  const onInstallRealm = () => {
    return OnboardingIPC.installRealmAgent();
  };

  const onNext = async () => {
    onFinish?.();

    return true;
  };

  return (
    <InstallationDialog
      onInstallRealm={onInstallRealm}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
