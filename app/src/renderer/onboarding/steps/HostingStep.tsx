import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { observer } from 'mobx-react';

import { HostingDialog, OnboardingStorage } from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { useAppState } from '../../stores/app.store';
import { StepProps } from './types';

export const HostingStepPresenter = ({ setStep }: StepProps) => {
  const { authStore } = useAppState();

  useEffect(() => {
    track('Onboarding / Hosting');
  });

  const onBack = () => {
    if (authStore.accounts.length > 0) {
      OnboardingIPC.finishOnboarding();
    } else {
      setStep('/login');
    }
  };

  const onGetHosting = async () => {
    window.open('https://hosting.holium.com', '_blank');
  };

  const onAddExistingServer = () => {
    OnboardingStorage.set({ serverType: 'local' });
    setStep('/add-identity');
  };

  return (
    <HostingDialog
      onBack={onBack}
      onGetHosting={onGetHosting}
      onAddExistingServer={onAddExistingServer}
    />
  );
};

export const HostingStep = observer(HostingStepPresenter);
