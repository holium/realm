import { FC, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import AppWindow from './components/Window';
import { ContextMenu } from 'renderer/components';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { ShellActions } from 'renderer/logic/actions/shell';

export const WindowManager: FC = observer(() => {
  const { shell, theme, desktop } = useServices();
  const isOpen = !desktop.showHomePane;
  const desktopRef = useRef<any>(null);

  const windows = Array.from(desktop.windows.values());

  useEffect(() => {
    const desktop = document.getElementById('desktop-fill');
    console.log(desktop);
  }, [desktop.windows]);

  return (
    <motion.div
      id="desktop-fill"
      ref={desktopRef}
      animate={{
        display: isOpen ? 'block' : 'none',
      }}
      style={{
        bottom: 0,
        padding: '8px',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        height: `calc(100vh - ${0}px)`,
        paddingTop: shell.isFullscreen ? 0 : 30,
      }}
    >
      <ContextMenu
        isComponentContext={false}
        textColor={theme.currentTheme.textColor}
        customBg={rgba(theme.currentTheme.windowColor, 0.9)}
        containerId="desktop-fill"
        parentRef={desktopRef}
        style={{ minWidth: 180 }}
        menu={[
          {
            label: 'Change wallpaper',
            onClick: (evt: any) => {
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
            onClick: (evt: any) => {
              DesktopActions.toggleDevTools();
            },
          },
        ]}
      />
      {windows.map((window: any, index: number) => {
        const key = `${window.id}-${index}`;
        // console.log('WindowManager', window.toJSON());
        return <AppWindow desktopRef={desktopRef} key={key} window={window} />;
      })}
    </motion.div>
  );
});
