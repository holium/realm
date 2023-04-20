import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { PasswordDialog } from '@holium/shared';
import { StepProps } from './types';
import { RealmIPC } from 'renderer/stores/ipc';

export const PasswordStep = ({ setStep }: StepProps) => {
  const patp = localStorage.getItem('patp');

  useEffect(() => {
    track('Onboarding / Password');
  });

  const onBack = () => {
    setStep('/passport');
  };

  const handleOnNext = async (password: string) => {
    if (!patp) return false;

    RealmIPC.updatePassword(patp, password);

    setStep('/installation');

    return true;
  };

  return <PasswordDialog onBack={onBack} onNext={handleOnNext} />;
};
