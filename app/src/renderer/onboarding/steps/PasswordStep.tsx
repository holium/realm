import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { PasswordDialog, OnboardingStorage } from '@holium/shared';
import { StepProps } from './types';
import { RealmIPC } from 'renderer/stores/ipc';

export const PasswordStep = ({ setStep }: StepProps) => {
  const { shipCode } = OnboardingStorage.get();

  useEffect(() => {
    track('Onboarding / Password');
  });

  const onBack = () => {
    setStep('/passport');
  };

  const handleOnNext = async (password: string) => {
    if (!shipCode) return false;

    RealmIPC.updatePassword(shipCode, password);

    setStep('/installation');

    return true;
  };

  return <PasswordDialog onBack={onBack} onNext={handleOnNext} />;
};
