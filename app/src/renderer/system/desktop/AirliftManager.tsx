import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import { useServices } from 'renderer/logic/store';
import { Airlift } from 'renderer/apps/Airlift';

const AirliftManagerPresenter = () => {
  // const { getOptions, setOptions } = useContextMenu();
  const { shell, airlift, desktop, spaces } = useServices();
  const id = 'airlift-fill';

  const airlifts = Array.from(
    airlift.airlifts.get(spaces.selected!.path)?.values() || []
  );
  // const windows = Array.from(desktop.windows.values());

  /*const contextMenuOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        label: 'Change wallpaper',
        onClick: () => {
          ShellActions.setBlur(true);
          ShellActions.openDialog('wallpaper-dialog');
        },
      },
      {
        label: 'Show dashboard',
        disabled: true,
        onClick: (evt: any) => {
          evt.stopPropagation();
          console.log('changing wallpaper');
        },
      },
      {
        label: 'Toggle devtools',
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
  }, [contextMenuOptions, getOptions, setOptions]);*/

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
      {airlifts.map((appWindow, index: number) => (
        // <AppWindow key={`${window.id}-${index}`} appWindow={appWindow} />
        <Airlift />
      ))}
    </motion.div>
  );
};

export const AirliftManager = observer(AirliftManagerPresenter);
