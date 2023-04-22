import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { AddServerDialog, OnboardingStorage } from '@holium/shared';
import { StepProps } from './types';
import { RealmIPC } from '../../stores/ipc';
import { defaultTheme } from '../../lib/defaultTheme';

export const AddServerStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Add Server');
  });

  const onBack = () => {
    setStep('/hosting');
  };

  const onNext = async (shipId: string, shipUrl: string, shipCode: string) => {
    const sanitizedCookie = await RealmIPC.getCookie(shipId, shipUrl, shipCode);

    if (!sanitizedCookie || !shipId || !shipUrl || !shipCode) return false;

    OnboardingStorage.set({
      shipId,
      shipUrl,
      shipCode,
    });

    const { passwordHash, masterAccountId } = OnboardingStorage.get();

    if (!shipId || !passwordHash || !masterAccountId) return false;

    await RealmIPC.createAccount(
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
      shipCode
    );

    setStep('/passport');

    return true;
  };

  return <AddServerDialog onBack={onBack} onNext={onNext} />;
};
