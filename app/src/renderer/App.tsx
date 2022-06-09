import { ThemeProvider } from 'styled-components';
import { MotionConfig } from 'framer-motion';
import { GlobalStyle } from './App.styles';
import { Shell } from './system';
import { theme } from './theme';
import {
  AuthProvider,
  authState,
  shipState,
  OSProvider,
  osState,
  ShipProvider,
  useMst,
  useShip,
  useSpaces,
} from './logic/store';
import * as RealmMultiplayer from '@holium/playground/src/lib/realm-multiplayer';
import { onStart } from './logic/api/realm.core';
import React, { useContext, useEffect, useMemo } from 'react';
import { Mouse } from './system/desktop/components/Mouse';

import { observer, Observer } from 'mobx-react';
import { Presences } from './system/desktop/components/Multiplayer/Presences';
import { api } from './system/desktop/components/Multiplayer/multiplayer';
import {
  CursorEvent,
  RealmMultiplayerInterface,
} from './system/desktop/components/Multiplayer/types';

export const App = observer(() => {
  const { themeStore, desktopStore } = useMst();
  useEffect(() => {
    onStart();
  }, []);

  const shellMemo = useMemo(
    () => (themeStore.loader.isLoaded ? <Shell /> : <div />),
    [themeStore.loader.isLoaded]
  );

  const mouseMemo = useMemo(() => {
    return (
      <Mouse
        hide={desktopStore.isMouseInWebview}
        cursorColor={desktopStore.mouseColor}
        animateOut={false}
      />
    );
  }, [desktopStore.mouseColor, desktopStore.isMouseInWebview]);

  return (
    <OSProvider value={osState}>
      <ThemeProvider theme={theme.light}>
        <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
          <GlobalStyle blur={true} />
          {/* Modal provider */}
          <AuthProvider value={authState}>
            <ShipProvider value={shipState}>
              {mouseMemo}
              {shellMemo}
              <MultiplayerMouse />
              <div id="portal-root" />
            </ShipProvider>
          </AuthProvider>
        </MotionConfig>
      </ThemeProvider>
    </OSProvider>
  );
});

function MultiplayerMouse() {
  const { ship } = useShip();
  const spacesStore = useSpaces();
  if (!ship?.isLoaded) return null;

  return (
    <RealmMultiplayer.Provider
      api={api}
      ship={ship}
      channel={spacesStore.selected?.id}
    >
      <Cursors />
    </RealmMultiplayer.Provider>
  );
}
function Cursors() {
  const { api } = useContext(
    RealmMultiplayer.Context as React.Context<{
      api: RealmMultiplayerInterface; // idk why typescript made me manually type this, maybe yarn workspace related
    }>
  );
  const { desktopStore } = useMst();
  useEffect(() => {
    // FIXME: faking multiplayer with delay
    setTimeout(() => {
      api?.send({
        event: CursorEvent.Leave,
      });
    }, 1500);
  }, [desktopStore.isMouseInWebview]);
  return <Presences />;
}

export default App;
