import { FC, useRef } from 'react';
import { observer } from 'mobx-react';
import { useMst } from 'renderer/logic/store';
import AppWindow from './components/AppWindow';

export const WindowManager: FC<any> = observer(() => {
  const { desktopStore, themeStore } = useMst();
  const desktopRef = useRef<any>(null);

  const managerType = 'classic';
  const hasOpenWindows = desktopStore.windows.size > 0;
  const windows = Array.from(desktopStore.windows.values());

  return (
    <div
      ref={desktopRef}
      style={{
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
      {hasOpenWindows &&
        windows.map((window: any, index: number) => (
          <AppWindow
            desktopRef={desktopRef}
            key={`${window.id}-${index}`}
            window={window}
            theme={themeStore}
          />
        ))}
    </div>
  );
});
