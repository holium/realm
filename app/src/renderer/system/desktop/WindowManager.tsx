import { FC, useRef, useEffect } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import AppWindow from './components/AppWindow';
import { ContextMenu } from 'renderer/components';
import { toggleDevTools } from 'renderer/logic-old/desktop/api';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store-2';

type WindowManagerProps = {
  isOpen?: boolean;
};

export const WindowManager: FC<WindowManagerProps> = observer(
  (props: WindowManagerProps) => {
    const { isOpen } = props;
    // const { desktop, theme } = useMst();
    const { shell } = useServices();
    const { desktop, theme } = shell;
    const desktopRef = useRef<any>(null);

    useEffect(() => {
      const dims = desktopRef.current?.getBoundingClientRect();
      desktop.setDesktopDimensions(dims.width, dims.height);
    }, [desktopRef.current]);

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
          textColor={theme.theme.textColor}
          customBg={rgba(theme.theme.windowColor, 0.9)}
          containerId="desktop-fill"
          parentRef={desktopRef}
          style={{ minWidth: 180 }}
          menu={[
            {
              label: 'Change wallpaper',
              disabled: true,
              onClick: (evt: any) => {
                evt.stopPropagation();
                console.log('changing wallpaper');
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
                toggleDevTools();
                // window.openDevTools();
                // console.log('open app info');
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
              theme={theme.theme}
            />
          );
        })}
      </motion.div>
    );
  }
);
