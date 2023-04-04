import { MotionConfig } from 'framer-motion';
import { BgImage, GlobalStyle } from './App.styles';
import { Shell } from './system';
import { useEffect, useMemo } from 'react';
import { Flex, Spinner, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { useAppState, appState, AppStateProvider } from './stores/app.store';
import { Auth } from './system/authentication';
import { SelectionProvider } from './logic/lib/selection';
import { ErrorBoundary } from './logic/ErrorBoundary';

function AppContentPresenter() {
  const { authStore, booted } = useAppState();
  if (!booted) {
    return (
      <Flex>
        <Spinner size={2} />
      </Flex>
    );
  }
  const isOnboarding = authStore.accounts.length === 0;
  const isLoggedOut = !authStore.session;

  if (isOnboarding) {
    // TODO onboarding here
    return (
      <Flex>
        <Text.Custom>onboarding</Text.Custom>
      </Flex>
    );
  }
  if (isLoggedOut) {
    return <Auth />;
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
