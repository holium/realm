import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import {
  AddIdentityDialog,
  defaultTheme,
  OnboardingStorage,
} from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { StepProps } from './types';

export const AddIdentityStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Add Identity');
  });

  const onBack = () => {
    setStep('/hosting');
  };

  const onNext = async (
    serverId: string,
    serverUrl: string,
    serverCode: string
  ) => {
    const sanitizedCookie = await OnboardingIPC.getCookieAndOpenConduit({
      serverId,
      serverUrl,
      serverCode,
    });

    if (!sanitizedCookie || !serverId || !serverUrl || !serverCode)
      return false;

    OnboardingStorage.set({
      serverId,
      serverUrl,
      serverCode,
    });

    OnboardingIPC.setCredentials({
      serverId,
      serverCode,
      serverUrl,
    });

    const { passwordHash, masterAccountId } = OnboardingStorage.get();

    if (!serverId || !passwordHash || !masterAccountId) return false;

    await OnboardingIPC.createAccount(
      {
        accountId: masterAccountId,
        passwordHash,
        serverId,
        serverUrl,
        serverType: 'local',
        avatar: '',
        nickname: '',
        description: '',
        color: '#000000',
        status: 'initial',
        theme: JSON.stringify(defaultTheme),
      },
      passwordHash,
      serverCode
    );

    setStep('/installation');

    return true;
  };

  return <AddIdentityDialog onBack={onBack} onNext={onNext} />;
};
