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
import { ShellActions } from './logic/actions/shell';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { SelectionProvider } from './logic/lib/selection';
import { ErrorBoundary } from './logic/ErrorBoundary';

const AppPresenter = () => {
  const { booted } = useCore();
  const { theme } = useServices();

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
        />
      ),
    [booted, theme.currentTheme.backgroundColor]
  );

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
                <ErrorBoundary>
                  {shellMemo}
                  {contextMenuMemo}
                  <div id="portal-root" />
                  <div id="menu-root" />
                </ErrorBoundary>
              </ContextMenuProvider>
            </SelectionProvider>
          </ServiceProvider>
        </MotionConfig>
      </ThemeProvider>
    </CoreProvider>
  );
};

export const App = observer(AppPresenter);
