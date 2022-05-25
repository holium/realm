import { FC, useRef, useEffect } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';

import { useMst } from 'renderer/logic/store';
import AppWindow from './components/AppWindow';
import { ContextMenu } from 'renderer/components';
import { toggleDevTools } from 'renderer/logic/desktop/api';

type WindowManagerProps = {
  isOpen?: boolean;
};

export const WindowManager: FC<WindowManagerProps> = observer(
  (props: WindowManagerProps) => {
    const { isOpen } = props;
    const { desktopStore, themeStore } = useMst();
    const desktopRef = useRef<any>(null);

    useEffect(() => {
      const dims = desktopRef.current?.getBoundingClientRect();
      desktopStore.setDesktopDimensions(dims.width, dims.height);
    }, [desktopRef.current]);

    const managerType = 'classic';
    const hasOpenWindows = desktopStore.windows.size > 0;
    const windows = Array.from(desktopStore.windows.values());

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
          paddingTop: desktopStore.isFullscreen ? 0 : 30,
        }}
      >
        <ContextMenu
          isComponentContext={false}
          textColor={themeStore.theme.textColor}
          customBg={themeStore.theme.windowColor}
          containerId="desktop-fill"
          parentRef={desktopRef}
          style={{ minWidth: 180 }}
          menu={[
            {
              label: 'Change wallpaper',
              onClick: (evt: any) => {
                evt.stopPropagation();
                console.log('changing wallpaper');
              },
            },
            {
              label: 'Toggle DevTools',
              section: 2,
              onClick: (evt: any) => {
                toggleDevTools();
                // window.openDevTools();
                // console.log('open app info');
              },
            },
          ]}
        />
        {hasOpenWindows &&
          windows.map((window: any, index: number) => (
            <AppWindow
              desktopRef={desktopRef}
              key={`${window.id}-${index}`}
              window={window}
              theme={themeStore.theme}
            />
          ))}
      </motion.div>
    );
  }
);
