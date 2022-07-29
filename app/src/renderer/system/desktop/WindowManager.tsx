import { FC, useRef, useEffect } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import AppWindow from './components/Window';
import { ContextMenu } from 'renderer/components';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { ShellActions } from 'renderer/logic/actions/shell';

type WindowManagerProps = {
  isOpen?: boolean;
};

export const WindowManager: FC<WindowManagerProps> = observer(
  (props: WindowManagerProps) => {
    const { isOpen } = props;
    const { desktop } = useServices();
    const desktopRef = useRef<any>(null);

    // useEffect(() => {
    //   const dims = desktopRef.current?.getBoundingClientRect();
    //   ShellActions.setDesktopDimensions(dims.width, dims.height);
    // }, [desktopRef.current]);

    const managerType = 'classic';
    const hasOpenWindows = desktop.windows.size > 0;

    const windows = Array.from(desktop.windows.values());

    return (
      <motion.div
        id="desktop-fill"
        ref={desktopRef}
        animate={{
          display: isOpen ? 'block' : 'none',
        }}
        style={{
          // display: isOpen ? 'block' : 'none',
          bottom: 0,
          padding: '8px',
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: `calc(100vh - ${0}px)`,
          paddingTop: desktop.isFullscreen ? 0 : 30,
        }}
      >
        <ContextMenu
          isComponentContext={false}
          textColor={desktop.theme.textColor}
          customBg={rgba(desktop.theme.windowColor, 0.9)}
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
          return (
            <AppWindow
              desktopRef={desktopRef}
              key={key}
              window={window}
              theme={desktop.theme}
            />
          );
        })}
      </motion.div>
    );
  }
);
