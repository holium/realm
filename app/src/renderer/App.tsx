import { ThemeProvider } from 'styled-components';
import { MotionConfig } from 'framer-motion';
import { GlobalStyle } from './App.styles';
import { Shell } from './system/shell';
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
} from './logic/store';
import { onStart } from './logic/api/realm.core';
import { useEffect } from 'react';
// import { Mouse } from './system/shell/desktop/components/Mouse';
import { Mouse } from './system/shell/desktop/components/Mouse';

import { Observer } from 'mobx-react';

export const App = () => {
  const { desktopStore, themeStore } = useMst();
  useEffect(() => {
    onStart();
  }, []);

  // const isInitialLoaded = useMemo(
  //   () => authStore.isLoaded,
  //   [authStore.isLoaded]
  // );

  return (
    <OSProvider value={osState}>
      <ThemeProvider theme={theme.light}>
        <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
          <GlobalStyle blur={true} />
          {/* Modal provider */}
          <AuthProvider value={authState}>
            <ShipProvider value={shipState}>
              <Observer>
                {() => {
                  return desktopStore.dynamicMouse ? (
                    <Mouse
                      animateOut={false}
                      hide={desktopStore.isMouseInWebview}
                      cursorColor={themeStore.theme.mouseColor}
                    />
                  ) : null;
                }}
              </Observer>
              <Shell />
              <div id="portal-root" />
            </ShipProvider>
          </AuthProvider>
        </MotionConfig>
      </ThemeProvider>
    </OSProvider>
  );
};

export default App;
