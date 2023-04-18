import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { AddServerDialog } from '@holium/shared';
import { StepProps } from './types';
import { RealmIPC } from 'renderer/stores/ipc';

export const AddServerStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Add Server');
  });

  const onBack = () => {
    setStep('/hosting');
  };

  const onNext = async (patp: string, url: string, code: string) => {
    const sanitizedCookie = await RealmIPC.getCookie(patp, url, code);

    if (sanitizedCookie) {
      localStorage.setItem('patp', patp);
      localStorage.setItem('url', url);
      localStorage.setItem('code', code);
      localStorage.setItem('step', '/passport');
      setStep('/passport');

      return true;
    }

    return false;
  };

  return <AddServerDialog onBack={onBack} onNext={onNext} />;
};
