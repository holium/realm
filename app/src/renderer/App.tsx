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
} from './logic/store';
import { onStart } from './logic/api/realm.core';
import { useEffect } from 'react';

export const App = () => {
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
          <GlobalStyle />
          {/* Modal provider */}
          <AuthProvider value={authState}>
            <ShipProvider value={shipState}>
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
