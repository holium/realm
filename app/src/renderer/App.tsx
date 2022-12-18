import { ThemeProvider } from 'styled-components';
import { MotionConfig } from 'framer-motion';
import { GlobalStyle } from './App.styles';
import { Shell } from './system';
import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { theme as baseTheme } from './theme';
import {
  CoreProvider,
  useCore,
  coreStore,
  ServiceProvider,
  servicesStore,
  useServices,
} from './logic/store';
import { Mouse } from './system/desktop/components/Mouse';
import { ShellActions } from './logic/actions/shell';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { SelectionProvider } from './logic/lib/selection';
import { ErrorBoundary } from './logic/ErrorBoundary';
// import * as RealmMultiplayer from '@holium/realm-multiplayer';
// import { Presences } from './system/desktop/components/Multiplayer/Presences';
// import { api } from './system/desktop/components/Multiplayer/multiplayer';

export const App = observer(() => {
  const { booted } = useCore();
  const { desktop, shell, theme } = useServices();

  const themeMode = theme.currentTheme.mode;

  const shellMemo = useMemo(
    () =>
      booted ? (
        <Shell />
      ) : (
        <div
          style={{
            height: '100vh',
            background: theme.currentTheme.backgroundColor,
          }}
        >
          {/* <Spinner size={4} /> */}
        </div>
      ),
    [booted, theme.currentTheme.backgroundColor]
  );

  const mouseMemo = useMemo(() => {
    return (
      <Mouse
        hide={shell.isMouseInWebview}
        cursorColor={desktop.mouseColor}
        animateOut={false}
      />
    );
  }, [desktop.mouseColor, shell.isMouseInWebview]);

  const contextMenuMemo = useMemo(() => <ContextMenu />, []);

  useEffect(() => {
    return () => {
      console.log('on dismount');
      ShellActions.closeDialog();
    };
  }, []);
  return (
    <CoreProvider value={coreStore}>
      <ThemeProvider theme={baseTheme[themeMode as 'light' | 'dark']}>
        <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
          <GlobalStyle blur={true} realmTheme={theme.currentTheme} />
          {/* Modal provider */}
          <ServiceProvider value={servicesStore}>
            <SelectionProvider>
              <ContextMenuProvider>
                {mouseMemo}
                <ErrorBoundary>
                  {shellMemo}
                  {contextMenuMemo}
                  {/* <MultiplayerMouse /> */}
                  <div id="portal-root" />
                </ErrorBoundary>
              </ContextMenuProvider>
            </SelectionProvider>
          </ServiceProvider>
        </MotionConfig>
      </ThemeProvider>
    </CoreProvider>
  );
});

// function MultiplayerMouse() {
//   const { ship, spaces } = useServices();
//   if (!ship?.isLoaded) return null;

//   return (
//     <RealmMultiplayer.Provider
//       api={api}
//       ship={ship}
//       channel={spaces.selected?.path}
//     >
//       <Cursors />
//     </RealmMultiplayer.Provider>
//   );
// }

// function Cursors() {
//   const { api } = useContext(
//     RealmMultiplayer.Context as React.Context<{
//       api: RealmMultiplayer.RealmMultiplayerInterface; // idk why typescript made me manually type this, maybe yarn workspace related
//     }>
//   );
//   const { shell } = useServices();
//   useEffect(() => {
//     api?.send({
//       event: RealmMultiplayer.CursorEvent.Leave,
//     });
//   }, [shell.isMouseInWebview]);
//   return <Presences />;
// }

export default App;
