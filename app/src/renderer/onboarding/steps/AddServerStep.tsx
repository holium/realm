import { useEffect } from 'react';
import { AddServerDialog } from '@holium/shared';
import { track } from '@amplitude/analytics-browser';
import { StepProps } from './types';

export const AddServerStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Add Server');
  });

  const onBack = () => {
    setStep('/hosting');
  };

  const onNext = () => {
    setStep('/passport');

    return Promise.resolve(true);
  };

  return <AddServerDialog onBack={onBack} onNext={onNext} />;
};
