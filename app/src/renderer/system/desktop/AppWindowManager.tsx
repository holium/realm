import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';

import { nativeApps } from 'renderer/apps/nativeApps';
import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { useAppState } from 'renderer/stores/app.store';
import { AppType } from 'renderer/stores/models/bazaar.model';

import { TITLEBAR_HEIGHT } from '../titlebar/Titlebar';
import { AppWindow } from './components/AppWindow/AppWindow';

const AppWindowManagerPresenter = () => {
  const { shellStore, showTitleBar } = useAppState();
  const { getOptions, setOptions } = useContextMenu();
  const id = 'desktop-fill';

  const windows = Array.from(shellStore.windows.values());

  const contextMenuOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        label: 'Change wallpaper',
        icon: 'Palette',
        onClick: () => {
          shellStore.openWindow(nativeApps['os-settings'] as AppType, {
            route: 'theme',
          });
        },
      },
      // TODO leave in as a reminder to add this feature
      // {
      //   label: 'Show widgets',
      //   disabled: true,
      //   onClick: (evt: any) => {
      //     evt.stopPropagation();
      //   },
      // },
      {
        label: 'Toggle devtools',
        icon: 'DevBox',
        onClick: () => {
          shellStore.toggleDevTools();
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (contextMenuOptions && contextMenuOptions !== getOptions(id)) {
      setOptions(id, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions]);

  return (
    <motion.div
      id={id}
      animate={{
        display: shellStore.isHomePaneOpen ? 'none' : 'block',
      }}
      style={{
        bottom: 0,
        padding: '8px',
        position: 'fixed',
        left: 0,
        top: showTitleBar ? TITLEBAR_HEIGHT : 0,
        right: 0,
        height: showTitleBar ? `calc(100vh - ${TITLEBAR_HEIGHT}px)` : '100vh',
        paddingTop: 0,
      }}
    >
      {windows.map((appWindow) => (
        <AppWindow key={appWindow.appId} appWindow={appWindow} />
      ))}
    </motion.div>
  );
};

export const AppWindowManager = observer(AppWindowManagerPresenter);
