import { useEffect, useMemo } from 'react';
import { MotionConfig } from 'framer-motion';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { GlobalStyle, RealmBackground } from './App.styles';
import { AppContent } from './AppContent';
import { AppLoading } from './AppLoading';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { SelectionProvider } from './lib/selection';
import { appState, AppStateProvider, useAppState } from './stores/app.store';
import { RealmIPC } from './stores/ipc';
import { ErrorBoundary } from './system/ErrorBoundary';

import './app.css';
import 'photoswipe/dist/photoswipe.css';

const Titlebar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 28px;
  background: var(--rlm-dock-color);
  z-index: 100;
  -webkit-user-select: none;
  -webkit-app-region: drag;
`;

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
        {!shellStore.isFullscreen && <Titlebar />}
        <RealmBackground
          blurred={shellStore.isBlurred}
          snapView={shellStore.snapView}
          wallpaper={bgImage}
        />
        <SelectionProvider>
          <ContextMenuProvider>
            <ErrorBoundary>
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
