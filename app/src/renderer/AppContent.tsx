import { observer } from 'mobx-react';

import { Onboarding } from './onboarding/Onboarding';
import { Splash } from './onboarding/Splash';
import { useAppState } from './stores/app.store';
import { Shell } from './system';
import { Auth } from './system/authentication/Auth';

const AppContentPresenter = () => {
  const { seenSplash, currentScreen } = useAppState();

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
