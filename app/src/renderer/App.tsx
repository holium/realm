import { MotionConfig } from 'framer-motion';
import { BgImage, GlobalStyle } from './App.styles';
import { Shell } from './system';
import { useEffect, useMemo } from 'react';
import { Flex, Spinner } from '@holium/design-system';
import { observer } from 'mobx-react';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { useAppState, appState, AppStateProvider } from './stores/app.store';
import { Auth } from './system/authentication';
import { SelectionProvider } from './logic/lib/selection';
import { ErrorBoundary } from './logic/ErrorBoundary';

function AppContent() {
  const { authStore, booted } = useAppState();
  if (!booted) {
    return (
      <Flex>
        <Spinner size={2} />
      </Flex>
    );
  }
  return authStore.session ? <Shell /> : <Auth />;
}

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
