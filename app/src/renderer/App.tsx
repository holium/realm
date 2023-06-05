import { useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { observer } from 'mobx-react';

import {
  GlobalStyle,
  RealmBackground,
  StandAloneChatTitlebar,
} from './App.styles';
import { AppContent } from './AppContent';
import { AppLoading } from './AppLoading';
import { StandaloneChat } from './apps/StandaloneChat/StandaloneChat';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { SelectionProvider } from './lib/selection';
import { appState, AppStateProvider, useAppState } from './stores/app.store';
import { RealmIPC } from './stores/ipc';
import { ErrorBoundary } from './system/ErrorBoundary';
import { RealmTitlebar } from './system/Titlebar';

import './app.css';
import 'photoswipe/dist/photoswipe.css';

const AppPresenter = () => {
  const { theme, shellStore, booted } = useAppState();

  const [isStandaloneChat, setStandaloneChat] = useState(
    shellStore.isStandaloneChat
  );

  useEffect(() => {
    window.electron.app.isStandaloneChat().then(setStandaloneChat);
  }, []);

  const contextMenu = useMemo(() => <ContextMenu />, []);
  const titlebar = useMemo(() => {
    if (shellStore.isFullscreen) {
      return null;
    }

    return isStandaloneChat ? <StandAloneChatTitlebar /> : <RealmTitlebar />;
  }, [shellStore.isFullscreen, isStandaloneChat]);
  const background = useMemo(() => {
    if (isStandaloneChat) {
      return null;
    }

    return (
      <RealmBackground
        blurred={shellStore.isBlurred}
        snapView={shellStore.snapView}
        wallpaper={theme.wallpaper}
      />
    );
  }, [
    theme.wallpaper,
    shellStore.isBlurred,
    shellStore.snapView,
    isStandaloneChat,
  ]);
  const content = useMemo(() => {
    if (!booted) {
      return <AppLoading />;
    }

    if (isStandaloneChat) {
      return <StandaloneChat />;
    }

    return <AppContent />;
  }, [isStandaloneChat, booted]);

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
        <SelectionProvider>
          <ContextMenuProvider>
            <ErrorBoundary>
              {titlebar}
              {background}
              {content}
              {contextMenu}
              <div id="portal-root" />
            </ErrorBoundary>
          </ContextMenuProvider>
        </SelectionProvider>
      </AppStateProvider>
    </MotionConfig>
  );
};

export const App = observer(AppPresenter);
