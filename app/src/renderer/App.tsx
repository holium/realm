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
import * as RealmMultiplayer from '../../../playground/ui/src/lib/realm-multiplayer';
import { onStart } from './logic/api/realm.core';
import { useEffect, useMemo } from 'react';
import { Mouse } from './system/desktop/components/Mouse';

import { observer, Observer } from 'mobx-react';
import { Presences } from './system/desktop/components/Multiplayer/Presences';

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

  // const spacesStore = useSpaces();

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
              {/* <RealmMultiplayer.Provider channel={''}>
                <Presences />
              </RealmMultiplayer.Provider> */}
              <div id="portal-root" />
            </ShipProvider>
          </AuthProvider>
        </MotionConfig>
      </ThemeProvider>
    </OSProvider>
  );
});

export default App;
