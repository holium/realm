import { ThemeProvider } from 'styled-components';
import { MotionConfig } from 'framer-motion';
import { GlobalStyle } from './App.styles';
import { Shell } from './system';
import { useContext, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { theme } from './theme';
import {
  CoreProvider,
  useCore,
  coreStore,
  ServiceProvider,
  servicesStore,
  useServices,
} from './logic/store';

import { Mouse } from './system/desktop/components/Mouse';
import * as RealmMultiplayer from '../../../playground/ui/src/lib/realm-multiplayer';
import { Presences } from './system/desktop/components/Multiplayer/Presences';
import { api } from './system/desktop/components/Multiplayer/multiplayer';

import {
  CursorEvent,
  RealmMultiplayerInterface,
} from './system/desktop/components/Multiplayer/types';

export const App = observer(() => {
  const { booted } = useCore();
  const { shell } = useServices();
  const { desktop } = shell;
  // const shipLoaded = ship?.loggedIn;
  const textTheme = desktop.theme.textTheme;

  const shellMemo = useMemo(
    () => (booted ? <Shell /> : <div>Booting...</div>),
    [booted]
  );
  const mouseMemo = useMemo(() => {
    return (
      <Mouse
        hide={desktop.isMouseInWebview}
        cursorColor={desktop.mouseColor}
        animateOut={false}
      />
    );
  }, [desktop.mouseColor, desktop.isMouseInWebview]);

  return (
    <CoreProvider value={coreStore}>
      <ThemeProvider theme={theme[textTheme]}>
        <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
          <GlobalStyle blur={true} />
          {/* Modal provider */}

          <ServiceProvider value={servicesStore}>
            {mouseMemo}
            {shellMemo}
            <MultiplayerMouse />
            <div id="portal-root" />
          </ServiceProvider>
        </MotionConfig>
      </ThemeProvider>
    </CoreProvider>
  );
});

function MultiplayerMouse() {
  const { ship, spaces } = useServices();
  if (!ship?.isLoaded) return null;

  return (
    <RealmMultiplayer.Provider
      api={api}
      ship={ship}
      channel={spaces.selected?.path}
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
  const { shell } = useServices();
  useEffect(() => {
    api?.send({
      event: CursorEvent.Leave,
    });
  }, [shell.desktop.isMouseInWebview]);
  return <Presences />;
}

export default App;
