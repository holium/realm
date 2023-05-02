import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { observer } from 'mobx-react';

import { HostingDialog, OnboardingStorage } from '@holium/shared';

import { useAppState } from '../../stores/app.store';
import { StepProps } from './types';

export const HostingStepPresenter = ({ setStep, onFinish }: StepProps) => {
  const { authStore } = useAppState();

  useEffect(() => {
    track('Onboarding / Hosting');
  });

  const onBack = () => {
    if (authStore.accounts.length > 0) {
      onFinish?.();
    } else {
      setStep('/login');
    }
  };

  const onGetHosting = () => {
    OnboardingStorage.set({ serverType: 'hosted' });
    setStep('/choose-id');
  };

  const onAddExistingServer = () => {
    OnboardingStorage.set({ serverType: 'local' });
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

export const HostingStep = observer(HostingStepPresenter);
