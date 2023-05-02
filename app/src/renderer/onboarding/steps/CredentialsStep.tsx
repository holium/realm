import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';

import { CredentialsDialog, OnboardingStorage } from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { StepProps } from './types';

export const CredentialsStep = ({ setStep }: StepProps) => {
  const [credentials, setCredentials] = useState({
    id: '',
    url: '',
    accessCode: '',
  });

  const onNext = () => {
    setStep('/passport');

    return Promise.resolve(true);
  };

  useEffect(() => {
    track('Onboarding / Credentials');
  });

  useEffect(() => {
    const { serverId, serverUrl, serverCode } = OnboardingStorage.get();
    if (!serverId || !serverUrl || !serverCode) return;

    setCredentials({
      id: serverId,
      url: serverUrl,
      accessCode: serverCode,
    });
    OnboardingIPC.setCredentials({
      serverId: serverId,
      serverCode: serverCode,
      serverUrl: serverUrl,
    });
  }, []);

  return <CredentialsDialog credentials={credentials} onNext={onNext} />;
};
