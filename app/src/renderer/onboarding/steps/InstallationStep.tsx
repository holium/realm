import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { InstallationDialog } from '@holium/shared';
import { StepProps } from './types';
import { RealmIPC } from 'renderer/stores/ipc';

type Props = {
  onFinish?: () => void;
} & StepProps;

export const InstallationStep = ({ setStep, onFinish }: Props) => {
  useEffect(() => {
    track('Onboarding / Installation');
  });

  const onBack = () => {
    setStep('/passport');
  };

  const onInstallRealm = async () => {
    await RealmIPC.setReleaseChannel('latest');
    return Promise.resolve(true);
  };

  const onNext = async () => {
    onFinish?.();
    return Promise.resolve(true);
  };

  return (
    <InstallationDialog
      onInstallRealm={onInstallRealm}
      onBack={onBack}
      onNext={onNext}
    />
  );
};
