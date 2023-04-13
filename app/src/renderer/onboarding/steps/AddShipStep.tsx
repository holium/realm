import { useEffect } from 'react';
import { AddShipDialog } from '@holium/shared';
import { track } from '@amplitude/analytics-browser';
import { StepProps } from './types';

export const AddShipStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Add ship');
  });

  const onBack = () => {
    setStep('/hosting');
  };

  const onNext = () => {
    setStep('/passport');

    return Promise.resolve(true);
  };

  return <AddShipDialog onBack={onBack} onNext={onNext} />;
};
