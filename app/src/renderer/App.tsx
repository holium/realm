import { MotionConfig } from 'framer-motion';
import { BgImage, GlobalStyle } from './App.styles';
import { Shell } from './system';
import { useEffect, useMemo } from 'react';
import { Flex, Spinner, useToggle } from '@holium/design-system';
import { observer } from 'mobx-react';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { useAppState, appState, AppStateProvider } from './stores/app.store';
import { SelectionProvider } from './lib/selection';
import { Onboarding } from './onboarding/Onboarding';
import { ErrorBoundary } from './system/ErrorBoundary';
import { Auth } from './system/authentication/index';
import { Splash } from './onboarding/Splash';

function AppContentPresenter() {
  const { seenSplash, authStore, booted } = useAppState();
  const addShip = useToggle(false);

  const isLoggedOut = !authStore.session;
  const hasNoAccounts = authStore.accounts.length === 0;

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

  if (hasNoAccounts) {
    return <Onboarding initialStep="/login" onFinish={addShip.toggleOff} />;
  }

  if (isLoggedOut) {
    if (addShip.isOn) {
      return <Onboarding initialStep="/hosting" onFinish={addShip.toggleOff} />;
    }

    return <Auth onAddShip={addShip.toggleOn} />;
  }

  return <Shell />;
}

export const AppContent = observer(AppContentPresenter);

const AppPresenter = () => {
  const { theme, shellStore } = useAppState();
  const contextMenuMemo = useMemo(() => <ContextMenu />, []);
  const bgImage = useMemo(() => theme.wallpaper, [theme.wallpaper]);

  useEffect(() => {
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
