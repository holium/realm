import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { OnboardingStorage } from '@holium/shared';

import { Onboarding } from './onboarding/Onboarding';
import { Splash } from './onboarding/Splash';
import { useAppState } from './stores/app.store';
import { OnboardingIPC } from './stores/ipc';
import { Shell } from './system';
import { Auth } from './system/authentication/index';

const AppContentPresenter = () => {
  const { authStore, seenSplash, currentScreen, setCurrentScreen } =
    useAppState();

  const { step: savedOnboardingStep } = OnboardingStorage.get();

  useEffect(() => {
    const accounts = authStore.accounts;
    const isLoggedIn = authStore.session;

    const setScreen = async () => {
      if (savedOnboardingStep && savedOnboardingStep !== '/login') {
        // This means the user was in the middle of onboarding.
        setCurrentScreen('onboarding');
        return;
      }

      if (accounts.length) {
        const masterAccount = await OnboardingIPC.getMasterAccount(
          accounts[0].accountId
        );

        if (masterAccount) {
          if (isLoggedIn) {
            setCurrentScreen('os');
            return;
          } else {
            setCurrentScreen('login');
            return;
          }
        }
      }

      setCurrentScreen('onboarding');
    };

    setScreen();
  }, [authStore.accounts, authStore.session, savedOnboardingStep]);

  const onAddServer = () => {
    setCurrentScreen('add-server');
    OnboardingStorage.set({ step: '/hosting' });
  };

  const onFinishOnboarding = () => {
    setCurrentScreen('login');
    OnboardingStorage.reset();
  };

  const onFinishAddServer = () => {
    setCurrentScreen('login');
    OnboardingStorage.reset();
  };

  if (!seenSplash) {
    return <Splash />;
  }

  if (currentScreen === 'onboarding') {
    return (
      <Onboarding
        initialStep={savedOnboardingStep ?? '/login'}
        onFinish={onFinishOnboarding}
      />
    );
  }

  if (currentScreen === 'add-server') {
    return (
      <Onboarding
        initialStep={savedOnboardingStep ?? '/hosting'}
        onFinish={onFinishAddServer}
      />
    );
  }

  if (currentScreen === 'login') {
    return <Auth onAddServer={onAddServer} />;
  }

  return <Shell />;
};

export const AppContent = observer(AppContentPresenter);
