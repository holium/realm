import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { AppWindow } from './components/AppWindow/AppWindow';
import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { useAppState } from 'renderer/stores/app.store';

const AppWindowManagerPresenter = () => {
  const { shellStore } = useAppState();
  const { getOptions, setOptions } = useContextMenu();
  const id = 'desktop-fill';

  const windows = Array.from(shellStore.windows.values());

  const contextMenuOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        label: 'Change wallpaper',
        icon: 'Palette',
        onClick: () => {
          shellStore.setIsBlurred(true);
          shellStore.openDialog('wallpaper-dialog');
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
        top: 0,
        right: 0,
        height: `calc(100vh - ${0}px)`,
        paddingTop: shellStore.isFullscreen ? 0 : 30,
      }}
    >
      {windows.map((appWindow, index: number) => (
        <AppWindow key={`${appWindow.appId}-${index}`} appWindow={appWindow} />
      ))}
    </motion.div>
  );
};

export const AppWindowManager = observer(AppWindowManagerPresenter);
