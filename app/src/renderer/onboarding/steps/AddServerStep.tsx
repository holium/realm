import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { AddServerDialog, OnboardingStorage } from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { defaultTheme } from '../../lib/defaultTheme';
import { StepProps } from './types';

export const AddServerStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Add Server');
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
      serverId: serverId,
      serverCode: serverCode,
      serverUrl: serverUrl,
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

    setStep('/passport');

    return true;
  };

  return <AddServerDialog onBack={onBack} onNext={onNext} />;
};
