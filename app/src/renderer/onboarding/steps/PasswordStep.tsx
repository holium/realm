import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { OnboardingStorage, PasswordDialog } from '@holium/shared';

import { RealmIPC } from 'renderer/stores/ipc';

import { StepProps } from './types';

export const PasswordStep = ({ setStep }: StepProps) => {
  const { serverCode } = OnboardingStorage.get();

  useEffect(() => {
    track('Onboarding / Password');
  });

  const onBack = () => {
    setStep('/passport');
  };

  const handleOnNext = async (password: string) => {
    if (!serverCode) return false;

    RealmIPC.updatePassword(serverCode, password);

    setStep('/installation');

    return true;
  };

  return <PasswordDialog onBack={onBack} onNext={handleOnNext} />;
};
