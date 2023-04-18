import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { AddServerDialog } from '@holium/shared';
import { StepProps } from './types';
import { getCookie } from 'os/lib/shipHelpers';

export const AddServerStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Add Server');
  });

  const onBack = () => {
    setStep('/hosting');
  };

  const onNext = async (patp: string, url: string, code: string) => {
    const cookie = await getCookie({ patp, url, code });
    if (!cookie) throw new Error('Failed to get cookie');
    const cookiePatp = cookie.split('=')[0].replace('urbauth-', '');
    // const sanitizedCookie = cookie.split('; ')[0];

    if (patp.toLowerCase() !== cookiePatp.toLowerCase()) {
      throw new Error('Invalid code.');
    }
    // TODO this should be removed.
    // this.core.saveSession({
    //   ship: patp,
    //   url,
    //   cookie: sanitizedCookie,
    //   code,
    // });
    // this.state.setShip({ patp, url });
    setStep('/passport');
  };

  return <AddServerDialog onBack={onBack} onNext={onNext} />;
};
