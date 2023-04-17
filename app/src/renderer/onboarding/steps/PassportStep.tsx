import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { PassportDialog } from '@holium/shared';
import { StepProps } from './types';

export const PassportStep = ({ setStep }: StepProps) => {
  const patp = localStorage.getItem('patp');

  useEffect(() => {
    track('Onboarding / Passport');
  });

  const onBack = () => {
    setStep('/login');
  };

  const onNext = () => {
    setStep('/installation');

    return Promise.resolve(true);
  };

  return <PassportDialog patp={patp} onBack={onBack} onNext={onNext} />;
};
