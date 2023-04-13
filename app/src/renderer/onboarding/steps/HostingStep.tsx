import { useEffect } from 'react';
import { HostingDialog } from '@holium/shared';
import { track } from '@amplitude/analytics-browser';
import { StepProps } from './types';

export const HostingStep = ({ setStep }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Hosting');
  });

  const onBack = () => {
    setStep('/login');
  };

  const onGetHosting = () => {
    setStep('/choose-id');
  };

  const onAddExistingServer = () => {
    setStep('/add-server');
  };

  return (
    <HostingDialog
      onBack={onBack}
      onGetHosting={onGetHosting}
      onAddExistingServer={onAddExistingServer}
    />
  );
};
