import { observer } from 'mobx-react';

import { TrayApp } from '@holium/design-system/os';

import { useTrayApps } from 'renderer/apps/store';

import { ErrorBoundary } from '../ErrorBoundary';
import { TrayAppKey, trayAppRenderers } from './components/SystemBar/apps';

const TrayManagerPresenter = () => {
  const { activeApp, coords, dimensions, setActiveApp } = useTrayApps();

  if (!activeApp) return null;

  const TrayAppComponent = trayAppRenderers[activeApp as TrayAppKey].component;
  const height = document.body.clientHeight;

  return (
    <TrayApp
      zIndex={100}
      id={activeApp as TrayAppKey}
      coords={{
        x: coords.left,
        y: height - dimensions.height - coords.bottom,
        height: dimensions.height,
        width: dimensions.width,
      }}
      closeTray={() => setActiveApp(null)}
    >
      <ErrorBoundary>{TrayAppComponent && <TrayAppComponent />}</ErrorBoundary>
    </TrayApp>
  );
};

export const TrayManager = observer(TrayManagerPresenter);
