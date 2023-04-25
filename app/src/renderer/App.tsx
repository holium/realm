import { MotionConfig } from 'framer-motion';
import { BgImage, GlobalStyle } from './App.styles';
import { Shell } from './system';
// import { toJS } from 'mobx';
import { useEffect, useMemo } from 'react';
import { Spinner, useToggle, Flex } from '@holium/design-system';
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
import { Centered, ViewPort, Fill } from 'react-spaces';

const AppContentPresenter = () => {
  const { seenSplash, authStore } = useAppState();

  const isLoggedOut = !authStore.session;
  const hasNoAccounts = authStore.accounts.length === 0;

  const savedOnboardingStep = OnboardingStorage.get().step;

  const onboarding = useToggle(hasNoAccounts);
  const addShip = useToggle(Boolean(savedOnboardingStep));
  useEffect(() => {
    // handles the case where we delete the last account
    if (hasNoAccounts) {
      onboarding.setToggle(true);
    } else {
      // handles when we go to add a ship and refresh. If we dont
      // check for this, we get stuck back at the login of onboarding
      // if (savedOnboardingStep === '/login' || !savedOnboardingStep) {
      //   addShip.toggleOff();
      //   OnboardingStorage.reset();
      // }
      onboarding.setToggle(false);
    }
  }, [hasNoAccounts]);

  const onAddShip = () => {
    addShip.toggleOn();
    OnboardingStorage.set({ step: '/hosting' });
  };

  const onFinishOnboarding = () => {
    console.log('onFinishOnboarding');
    onboarding.toggleOff();
    OnboardingStorage.reset();
  };

  const onFinishAddShip = () => {
    addShip.toggleOff();
    OnboardingStorage.reset();
  };

  if (!seenSplash) {
    return <Splash />;
  }

  if (onboarding.isOn || hasNoAccounts) {
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
};

const AppContent = observer(AppContentPresenter);

const AppPresenter = () => {
  const { theme, shellStore, booted } = useAppState();
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
              {!booted ? <LoadingApp /> : <AppContent />}
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

export const LoadingApp = () => (
  <ViewPort>
    <Fill>
      <Centered>
        <Flex width="100%" row justify="center">
          <Spinner color="#FFF" size={3} />
        </Flex>
      </Centered>
    </Fill>
  </ViewPort>
);
