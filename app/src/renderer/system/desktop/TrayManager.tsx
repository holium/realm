import { useRef } from 'react';
import { TrayAppKeys, useTrayApps } from 'renderer/apps/store';
import { observer } from 'mobx-react';
import { trayAppRenderers } from './components/SystemBar/apps';
import { TrayMenu } from './components/SystemBar/components/TrayMenu';
import { MiniApp } from './components/SystemBar/components/MiniAppWindow';

export const TrayManager = observer(() => {
  const trayAppRef = useRef<HTMLDivElement>();
  const { activeApp, coords } = useTrayApps();

  if (!activeApp) return null;

  const TrayAppView = trayAppRenderers[activeApp].component;

  return (
    <TrayMenu
      id={activeApp as TrayAppKeys}
      coords={coords}
      body={
        <MiniApp id={`${activeApp}-app`} innerRef={trayAppRef}>
          {TrayAppView && <TrayAppView />}
        </MiniApp>
      }
    />
  );
});

export default { TrayManager };
