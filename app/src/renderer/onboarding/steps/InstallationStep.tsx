import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { InstallationDialog, OnboardingStorage } from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { StepProps } from './types';

export const InstallationStep = ({ setStep, finishOnboarding }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Installation');
  });

  const onBack = () => {
    setStep('/passport');
  };

  const onInstallRealm = () => {
    const { serverId, serverUrl, serverCode } = OnboardingStorage.get();
    if (serverId && serverUrl && serverCode) {
      OnboardingIPC.setCredentials({
        serverId: serverId,
        serverCode: serverCode,
        serverUrl: serverUrl,
      });
    }

    return OnboardingIPC.installRealmAgent();
  };

  const onNext = async () => {
    finishOnboarding?.();

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
