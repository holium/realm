import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { InstallationDialog, OnboardingStorage } from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { StepProps } from './types';

export const InstallationStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Installation');
  });

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
    setStep('/passport');

    return true;
  };

  return <InstallationDialog onInstallRealm={onInstallRealm} onNext={onNext} />;
};
