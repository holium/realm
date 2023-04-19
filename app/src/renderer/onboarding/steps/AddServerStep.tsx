import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { AddServerDialog } from '@holium/shared';
import { StepProps } from './types';
import { RealmIPC } from 'renderer/stores/ipc';
import { defaultTheme } from 'renderer/lib/defaultTheme';

export const AddServerStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Add Server');
  });

  const onBack = () => {
    setStep('/hosting');
  };

  const onNext = async (patp: string, url: string, code: string) => {
    const sanitizedCookie = await RealmIPC.getCookie(patp, url, code);

    if (!sanitizedCookie || !patp || !url || !code) return false;

    localStorage.setItem('patp', patp);
    localStorage.setItem('url', url);
    localStorage.setItem('code', code);

    const password = localStorage.getItem('password');
    const accountId = Number(localStorage.getItem('masterAccountId'));

    if (!patp || !accountId || !password) return Promise.resolve(false);

    await RealmIPC.createAccount(
      {
        accountId,
        password,
        patp,
        avatar: '',
        nickname: '',
        description: '',
        color: '#000000',
        type: 'local',
        url,
        status: 'online',
        theme: JSON.stringify(defaultTheme),
      },
      code
    );

    setStep('/passport');

    return true;
  };

  return <AddServerDialog onBack={onBack} onNext={onNext} />;
};
