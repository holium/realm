import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { PassportDialog } from '@holium/shared';
import { StepProps } from './types';
import { RealmIPC } from '../../stores/ipc';
import { defaultTheme } from '../../lib/defaultTheme';

type Props = {
  onNext: () => Promise<boolean>;
} & StepProps;

export const PassportStep = ({ setStep, onNext }: Props) => {
  const patp = localStorage.getItem('patp');

  useEffect(() => {
    track('Onboarding / Passport');
  });

  const onBack = () => {
    setStep('/login');
  };

  const handleOnNext = async (
    username: string,
    description = '',
    avatar = ''
  ) => {
    const patp = localStorage.getItem('patp');
    const isHosted = localStorage.getItem('isHosted');
    const shipLink = localStorage.getItem('url');
    const accountId = Number(localStorage.getItem('masterAccountId'));

    console.log('patp', patp);
    console.log('isHosted', isHosted);
    console.log('shipLink', shipLink);
    console.log('accountId', accountId);

    if (!patp || !shipLink || !accountId) return Promise.resolve(false);

    await RealmIPC.createAccount({
      accountId,
      patp,
      avatar,
      nickname: username,
      description,
      color: '#000000',
      type: isHosted ? 'hosted' : 'local',
      url: shipLink,
      status: 'online',
      theme: JSON.stringify(defaultTheme),
    });

    if (isHosted) {
      onNext();
      setStep('/login');
    } else setStep('/installation');

    return true;
  };

  return <PassportDialog patp={patp} onBack={onBack} onNext={handleOnNext} />;
};
