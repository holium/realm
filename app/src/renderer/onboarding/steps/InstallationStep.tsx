import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { InstallationDialog, RealmInstallStatus } from '@holium/shared';

import { StepProps } from './types';

export const InstallationStep = ({ setStep, onFinish }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Installation');
  });

  const onBack = () => {
    setStep('/passport');
  };

  const onInstallRealm = (): Promise<RealmInstallStatus> => {
    return window.onboardingService.installRealmAgent();
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
