import { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Onboarding } from './onboarding/Onboarding';
import { Splash } from './onboarding/Splash';
import { useAppState } from './stores/app.store';
import { OnboardingIPC } from './stores/ipc';
import { Shell } from './system';
import { Auth } from './system/authentication/index';

const AppContentPresenter = () => {
  const { authStore, seenSplash, currentScreen, setCurrentScreen } =
    useAppState();

  useEffect(() => {
    const accounts = authStore.accounts;
    const isLoggedIn = authStore.session;

    const setScreen = async () => {
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
  }, [authStore.accounts, authStore.session]);

  if (!seenSplash) {
    return <Splash />;
  }

  if (currentScreen === 'onboarding') {
    return <Onboarding />;
  }

  if (currentScreen === 'login') {
    return <Auth />;
  }

  return <Shell />;
};

export const AppContent = observer(AppContentPresenter);
