import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { AppWindow } from './components/AppWindow/AppWindow';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { ShellActions } from 'renderer/logic/actions/shell';
import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';

const AppWindowManagerPresenter = () => {
  const { getOptions, setOptions } = useContextMenu();
  const { shell, desktop } = useServices();
  const id = 'desktop-fill';

  const windows = Array.from(desktop.windows.values());

  const contextMenuOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        label: 'Change wallpaper',
        icon: 'Palette',
        onClick: () => {
          ShellActions.setBlur(true);
          ShellActions.openDialog('wallpaper-dialog');
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
          DesktopActions.toggleDevTools();
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
        display: desktop.isHomePaneOpen ? 'none' : 'block',
      }}
      style={{
        bottom: 0,
        padding: '8px',
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        height: `calc(100vh - ${0}px)`,
        paddingTop: shell.isFullscreen ? 0 : 30,
      }}
    >
      {windows.map((appWindow, index: number) => (
        <AppWindow key={`${appWindow.appId}-${index}`} appWindow={appWindow} />
      ))}
    </motion.div>
  );
};

export const AppWindowManager = observer(AppWindowManagerPresenter);
