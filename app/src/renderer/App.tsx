import { useEffect, useMemo } from 'react';
import { MotionConfig } from 'framer-motion';
import { observer } from 'mobx-react';

import { GlobalStyle, RealmBackground } from './App.styles';
import { AppContent } from './AppContent';
import { AppLoading } from './AppLoading';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { SelectionProvider } from './lib/selection';
import { appState, AppStateProvider, useAppState } from './stores/app.store';
import { RealmIPC } from './stores/ipc';
import { ErrorBoundary } from './system/ErrorBoundary';
import { RealmTitlebar } from './system/Titlebar';

import './app.css';
import 'photoswipe/dist/photoswipe.css';

const AppPresenter = () => {
  const { theme, shellStore, booted, showTitleBar } = useAppState();
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

        <RealmBackground
          blurred={shellStore.isBlurred}
          snapView={shellStore.snapView}
          wallpaper={bgImage}
        />
        <SelectionProvider>
          <ContextMenuProvider>
            <ErrorBoundary>
              {showTitleBar && <RealmTitlebar />}
              {booted ? <AppContent /> : <AppLoading />}
              {contextMenuMemo}
              <div id="portal-root" />
              <div id="menu-root" />
              <div id="audio-root" />
            </ErrorBoundary>
          </ContextMenuProvider>
        </SelectionProvider>
      </AppStateProvider>
    </MotionConfig>
  );
};

export const App = observer(AppPresenter);
