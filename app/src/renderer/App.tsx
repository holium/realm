import { ThemeProvider } from 'styled-components';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { GlobalStyle } from './App.styles';
import { Shell } from './system';
import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { theme as baseTheme } from './theme';
// import {
//   CoreProvider,
//   useCore,
//   coreStore,
//   ServiceProvider,
//   servicesStore,
//   useServices,
// } from './logic/store';
import { ShellActions } from './logic/actions/shell';
import { ContextMenu, ContextMenuProvider } from './components/ContextMenu';
import { useAppState, appState, AppStateProvider } from './stores/app.store';
import { Auth } from './system/auth';
import { SelectionProvider } from './logic/lib/selection';
import { ErrorBoundary } from './logic/ErrorBoundary';
import { BackgroundImage } from './system/system.styles';

const AppPresenter = () => {
  const { booted, isLoggedIn, theme } = useAppState();

  const contextMenuMemo = useMemo(() => <ContextMenu />, []);

  useEffect(() => {
    return () => {
      ShellActions.closeDialog();
    };
  }, []);
  return (
    <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
      <AppStateProvider value={appState}>
        <GlobalStyle blur={true} realmTheme={theme} />
        <BgImage blurred={!isLoggedIn || true} wallpaper={theme.wallpaper} />
        {/* {booted && isLoggedIn && <Shell />} */}
        <SelectionProvider>
          <ContextMenuProvider>
            <ErrorBoundary>
              {booted && !isLoggedIn && <Auth />}
              {contextMenuMemo}
              <div id="portal-root" />
              <div id="menu-root" />
            </ErrorBoundary>
          </ContextMenuProvider>
        </SelectionProvider>

        {/* <AccountProvider value={accountStore}>
          <SelectionProvider>
            <ContextMenuProvider>
              <ErrorBoundary>
                <Shell />
                {contextMenuMemo}
                <div id="portal-root" />
                <div id="menu-root" />
              </ErrorBoundary>
            </ContextMenuProvider>
          </SelectionProvider>
        </AccountProvider> */}
      </AppStateProvider>
    </MotionConfig>
  );
  // return (
  //   <AppStateProvider value={appState}>
  //     <ThemeProvider theme={baseTheme[themeMode as 'light' | 'dark']}>
  //       <MotionConfig transition={{ duration: 1, reducedMotion: 'user' }}>
  //         <GlobalStyle blur={true} realmTheme={theme.currentTheme} />
  //         {/* Modal provider */}
  //         <AccountProvider value={accountStore}>
  //           <ServiceProvider value={servicesStore}>
  //             <SelectionProvider>
  //               <ContextMenuProvider>
  //                 <ErrorBoundary>
  //                   <Shell />
  //                   {contextMenuMemo}
  //                   <div id="portal-root" />
  //                   <div id="menu-root" />
  //                 </ErrorBoundary>
  //               </ContextMenuProvider>
  //             </SelectionProvider>
  //           </ServiceProvider>
  //         </AccountProvider>
  //       </MotionConfig>
  //     </ThemeProvider>
  //   </AppStateProvider>
  // );
};

const BgImage = ({
  blurred,
  wallpaper,
}: {
  blurred: boolean;
  wallpaper: string;
}) => {
  return useMemo(
    () => (
      <AnimatePresence>
        <BackgroundImage
          key={wallpaper}
          src={wallpaper}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          animate={{
            opacity: 1,
            filter: blurred ? `blur(24px)` : 'blur(0px)',
          }}
          transition={{
            opacity: { duration: 0.5 },
          }}
        />
      </AnimatePresence>
    ),
    [blurred, wallpaper]
  );
};

export const App = observer(AppPresenter);
