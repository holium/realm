import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { InstallationDialog } from '@holium/shared';
import { StepProps } from './types';
import { RealmIPC } from 'renderer/stores/ipc';

export const InstallationStep = ({ setStep, onFinish }: StepProps) => {
  useEffect(() => {
    track('Onboarding / Installation');
  });

  const onBack = () => {
    setStep('/passport');
  };

  const onInstallRealm = () => {
    return RealmIPC.installRealmAgent();
  };

  const onNext = async () => {
    onFinish?.();

    return true;
  };

  return (
    <InstallationDialog
      onInstallRealm={onInstallRealm}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
