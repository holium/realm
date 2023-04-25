import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { AddServerDialog, OnboardingStorage } from '@holium/shared';

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
    const sanitizedCookie = await window.onboardingService.getCookie(
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

    window.onboardingService.setCredentials({
      patp: shipId,
      code: shipCode,
      url: shipUrl,
    });

    const { passwordHash, masterAccountId } = OnboardingStorage.get();

    if (!shipId || !passwordHash || !masterAccountId) return false;

    await window.onboardingService.createAccount(
      {
        accountId: masterAccountId,
        passwordHash,
        patp: shipId,
        avatar: '',
        nickname: '',
        description: '',
        color: '#000000',
        type: 'local',
        url: shipUrl,
        status: 'online',
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