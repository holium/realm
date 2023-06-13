import { observer } from 'mobx-react';

import { StandaloneChat } from './apps/StandaloneChat/StandaloneChat';
import { Onboarding } from './onboarding/Onboarding';
import { Splash } from './onboarding/Splash';
import { useAppState } from './stores/app.store';
import { Shell } from './system';
import { Auth } from './system/authentication/Auth';

type Props = {
  isStandaloneChat: boolean;
};

const AppContentPresenter = ({ isStandaloneChat }: Props) => {
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

  if (isStandaloneChat) {
    return <StandaloneChat />;
  }

  return <Shell />;
};

export const AppContent = observer(AppContentPresenter);
