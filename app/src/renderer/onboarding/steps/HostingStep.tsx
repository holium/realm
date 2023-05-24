import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { observer } from 'mobx-react';

import { HostingDialog, OnboardingStorage } from '@holium/shared';

import { OnboardingIPC } from 'renderer/stores/ipc';

import { useAppState } from '../../stores/app.store';
import { thirdEarthApi } from '../thirdEarthApi';
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
    OnboardingStorage.set({ serverType: 'hosted' });

    // Check if authenticated.
    const usedToken = OnboardingStorage.get().token;
    if (!usedToken) setStep('/intermediary-login');

    try {
      const { email, token } = await thirdEarthApi.refreshToken(
        usedToken as string
      );
      OnboardingStorage.set({ email, token });

      setStep('/choose-id');
    } catch (error) {
      console.error(error);

      setStep('/intermediary-login');
    }
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
