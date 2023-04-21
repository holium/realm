import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { InstallationDialog, OnboardingStorage } from '@holium/shared';
import { StepProps } from './types';
import { RealmIPC } from 'renderer/stores/ipc';

export const InstallationStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Installation');
  });

  const onBack = () => {
    setStep('/passport');
  };

  const onInstallRealm = () => {
    return RealmIPC.installRealmAgent();
  };

  const onNext = async () => {
    OnboardingStorage.reset();

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
