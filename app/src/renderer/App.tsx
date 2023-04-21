import { MotionConfig } from 'framer-motion';
import { BgImage, GlobalStyle } from './App.styles';
import { Shell } from './system';
import { useEffect, useMemo } from 'react';
import { Flex, Spinner, useToggle } from '@holium/design-system';
import { OnboardingStorage } from '@holium/shared';
import { observer } from 'mobx-react';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { useAppState, appState, AppStateProvider } from './stores/app.store';
import { SelectionProvider } from './lib/selection';
import { Onboarding } from './onboarding/Onboarding';
import { ErrorBoundary } from './system/ErrorBoundary';
import { Auth } from './system/authentication/index';
import { Splash } from './onboarding/Splash';
import { RealmIPC } from './stores/ipc';

function AppContentPresenter() {
  const { seenSplash, authStore, booted } = useAppState();

  const isLoggedOut = !authStore.session;
  const hasNoAccounts = authStore.accounts.length === 0;

  const savedOnboardingStep = OnboardingStorage.get().step;

  const onboarding = useToggle(hasNoAccounts);
  const addShip = useToggle(Boolean(savedOnboardingStep));

  const onAddShip = () => {
    addShip.toggleOn();
    OnboardingStorage.set({ step: '/hosting' });
  };

  const onFinishOnboarding = () => {
    onboarding.toggleOff();
    OnboardingStorage.reset();
  };

  const onFinishAddShip = () => {
    addShip.toggleOff();
    OnboardingStorage.reset();
  };

  if (!booted) {
    return (
      <Flex>
        <Spinner size={2} />
      </Flex>
    );
  }
  if (!seenSplash) {
    return <Splash />;
  }

  if (onboarding.isOn) {
    return (
      <Onboarding
        initialStep={savedOnboardingStep ?? '/login'}
        onFinish={onFinishOnboarding}
      />
    );
  }

  if (isLoggedOut) {
    if (addShip.isOn) {
      return (
        <Onboarding
          initialStep={savedOnboardingStep ?? '/hosting'}
          onFinish={onFinishAddShip}
        />
      );
    }

    return <Auth onAddShip={onAddShip} />;
  }

  return <Shell />;
}

export const AppContent = observer(AppContentPresenter);

const AppPresenter = () => {
  const { theme, shellStore } = useAppState();
  const contextMenuMemo = useMemo(() => <ContextMenu />, []);
  const bgImage = useMemo(() => theme.wallpaper, [theme.wallpaper]);

  useEffect(() => {
    RealmIPC.boot();
    return () => {
      shellStore.closeDialog();
    };
  }, []);

  return (
    <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
      <AppStateProvider value={appState}>
        <GlobalStyle blur={true} realmTheme={theme} />
        <BgImage blurred={shellStore.isBlurred} wallpaper={bgImage} />
        <SelectionProvider>
          <ContextMenuProvider>
            <ErrorBoundary>
              <AppContent />
              {contextMenuMemo}
              <div id="portal-root" />
              <div id="menu-root" />
            </ErrorBoundary>
          </ContextMenuProvider>
        </SelectionProvider>
      </AppStateProvider>
    </MotionConfig>
  );
};

export const App = observer(AppPresenter);
