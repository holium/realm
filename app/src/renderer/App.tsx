import { useEffect, useMemo } from 'react';
import { MotionConfig } from 'framer-motion';
import { observer } from 'mobx-react';
import { ThemeProvider } from 'styled-components';

import { AccountProvider, accountStore } from './apps/Account/store';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { ShellActions } from './logic/actions/shell';
import { ErrorBoundary } from './logic/ErrorBoundary';
import { SelectionProvider } from './logic/lib/selection';
import {
  CoreProvider,
  coreStore,
  ServiceProvider,
  servicesStore,
  useCore,
  useServices,
} from './logic/store';
import { GlobalStyle } from './App.styles';
import { Shell } from './system';
import { theme as baseTheme } from './theme';

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
      ShellActions.closeDialog();
    };
  }, []);
  return (
    <CoreProvider value={coreStore}>
      <ThemeProvider theme={baseTheme[themeMode as 'light' | 'dark']}>
        <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
          <GlobalStyle blur={true} realmTheme={theme.currentTheme} />
          {/* Modal provider */}
          <AccountProvider value={accountStore}>
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
          </AccountProvider>
        </MotionConfig>
      </ThemeProvider>
    </CoreProvider>
  );
};

export const App = observer(AppPresenter);
