import { useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { observer } from 'mobx-react';

import { PassportMenuProvider } from 'renderer/components/People/usePassportMenu';

import { GlobalStyle, RealmBackground } from './App.styles';
import { AppContent } from './AppContent';
import { AppLoading } from './AppLoading';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { ShareModal, ShareModalProvider } from './components/ShareModal';
import { SelectionProvider } from './lib/selection';
import { appState, AppStateProvider, useAppState } from './stores/app.store';
import { RealmIPC } from './stores/ipc';
import { ErrorBoundary } from './system/ErrorBoundary';
import {
  RealmTitlebar,
  StandAloneChatTitlebar,
} from './system/titlebar/Titlebar';

import './app.css';
import 'photoswipe/dist/photoswipe.css';

const AppPresenter = () => {
  const { theme, shellStore, booted, showTitleBar, setShowTitleBar } =
    useAppState();

  const [isStandaloneChat, setIsStandaloneChat] = useState(
    shellStore.isStandaloneChat
  );

  useEffect(() => {
    window.electron.app.isStandaloneChat().then(setIsStandaloneChat);
    window.electron.app.shouldUseCustomTitlebar().then(setShowTitleBar);
  }, []);

  useEffect(() => {
    RealmIPC.boot();
    return () => {
      shellStore.closeDialog();
    };
  }, []);

  const contextMenu = useMemo(() => <ContextMenu />, []);
  const share = useMemo(() => <ShareModal />, []);

  const titlebar = useMemo(() => {
    if (!showTitleBar) return null;

    return isStandaloneChat ? <StandAloneChatTitlebar /> : <RealmTitlebar />;
  }, [showTitleBar, isStandaloneChat]);

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

  const content = booted ? (
    <AppContent isStandaloneChat={isStandaloneChat} />
  ) : (
    <AppLoading />
  );

  return (
    <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
      <AppStateProvider value={appState}>
        <GlobalStyle blur={true} realmTheme={theme} />
        {background}
        <SelectionProvider>
          <ShareModalProvider>
            <ContextMenuProvider>
              <PassportMenuProvider>
                <ErrorBoundary>
                  {titlebar}
                  {content}
                  {contextMenu}
                  {share}
                  <div id="portal-root" />
                </ErrorBoundary>
              </PassportMenuProvider>
            </ContextMenuProvider>
          </ShareModalProvider>
        </SelectionProvider>
      </AppStateProvider>
    </MotionConfig>
  );
};

export const App = observer(AppPresenter);
