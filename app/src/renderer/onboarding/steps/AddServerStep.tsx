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

  const onNext = async (shipId: string, shipUrl: string, shipCode: string) => {
    const sanitizedCookie = await OnboardingIPC.getCookie(
      shipId,
      shipUrl,
      shipCode
    );

    if (!sanitizedCookie || !shipId || !shipUrl || !shipCode) return false;

    OnboardingStorage.set({
      shipId,
      shipUrl,
      shipCode,
    });

    OnboardingIPC.setCredentials({
      serverId: shipId,
      serverCode: shipCode,
      serverUrl: shipUrl,
    });

    const { passwordHash, masterAccountId } = OnboardingStorage.get();

    if (!shipId || !passwordHash || !masterAccountId) return false;

    await OnboardingIPC.createAccount(
      {
        accountId: masterAccountId,
        passwordHash,
        serverId: shipId,
        serverUrl: shipUrl,
        serverCode: shipCode,
        serverType: 'local',
        avatar: '',
        nickname: '',
        description: '',
        color: '#000000',
        status: 'initial',
        theme: JSON.stringify(defaultTheme),
      },
      passwordHash,
      shipCode
    );

    setStep('/passport');

    return true;
  };

  return <AddServerDialog onBack={onBack} onNext={onNext} />;
};
